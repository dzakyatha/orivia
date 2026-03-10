import json
import requests
import logging
from decimal import Decimal, InvalidOperation
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache

from .models import (
    TravelPlan, TravelDay, Activity, Expense,
    Trip, TripSchedule, Booking, Transaction,
)

logger = logging.getLogger(__name__)


# =============================================
# Data-sync helpers
# =============================================

def _sync_travel_plan(data, user):
    """Sync a single RencanaPerjalanan (and nested children) from microservice JSON."""
    try:
        plan_id = data.get('id')
        if not plan_id:
            return

        plan, _ = TravelPlan.objects.update_or_create(
            id=plan_id,
            defaults={
                'user': user,
                'nama': data.get('nama', ''),
                'durasi_mulai': data.get('durasi_mulai'),
                'durasi_selesai': data.get('durasi_selesai'),
                'anggaran_jumlah': data.get('anggaran_jumlah', 0),
                'anggaran_mata_uang': data.get('anggaran_mata_uang', 'IDR'),
            },
        )

        # Sync nested HariPerjalanan
        existing_day_ids = set()
        for day_data in data.get('hariPerjalananList', []):
            day_id = day_data.get('idHari')
            if not day_id:
                continue
            existing_day_ids.add(str(day_id))
            day_obj, _ = TravelDay.objects.update_or_create(
                id=day_id,
                defaults={
                    'plan': plan,
                    'tanggal': day_data.get('tanggal'),
                },
            )
            # Sync nested Aktivitas
            existing_act_ids = set()
            for act_data in day_data.get('aktivitasList', []):
                act_id = act_data.get('idAktivitas')
                if not act_id:
                    continue
                existing_act_ids.add(str(act_id))
                lokasi = act_data.get('lokasi', {}) or {}
                Activity.objects.update_or_create(
                    id=act_id,
                    defaults={
                        'day': day_obj,
                        'waktu_mulai': act_data.get('waktuMulai'),
                        'waktu_selesai': act_data.get('waktuSelesai'),
                        'deskripsi': act_data.get('deskripsi', ''),
                        'lokasi_nama': lokasi.get('namaLokasi', ''),
                        'lokasi_alamat': lokasi.get('alamat', ''),
                        'lokasi_latitude': lokasi.get('latitude'),
                        'lokasi_longitude': lokasi.get('longitude'),
                    },
                )
            # Remove activities that are no longer in the response
            day_obj.activities.exclude(id__in=existing_act_ids).delete()

        # Remove days that are no longer in the response
        plan.days.exclude(id__in=existing_day_ids).delete()

        # Sync nested Pengeluaran
        existing_exp_ids = set()
        for exp_data in data.get('pengeluaranList', []):
            exp_id = exp_data.get('idPengeluaran')
            if not exp_id:
                continue
            existing_exp_ids.add(str(exp_id))
            Expense.objects.update_or_create(
                id=exp_id,
                defaults={
                    'plan': plan,
                    'deskripsi': exp_data.get('deskripsi', ''),
                    'tanggal_pengeluaran': exp_data.get('tanggalPengeluaran'),
                    'biaya_jumlah': exp_data.get('biaya_jumlah', 0),
                    'biaya_mata_uang': exp_data.get('biaya_mata_uang', 'IDR'),
                },
            )
        plan.expenses.exclude(id__in=existing_exp_ids).delete()

    except Exception:
        logger.exception("Failed to sync travel plan data")


def _sync_trip(data, user):
    """Sync a single Trip (and schedules) from microservice JSON."""
    try:
        trip_id = data.get('trip_id')
        if not trip_id:
            return

        itinerary = data.get('itinerary') or {}
        trip, _ = Trip.objects.update_or_create(
            trip_id=trip_id,
            defaults={
                'user': user,
                'trip_name': data.get('trip_name', ''),
                'capacity': data.get('capacity', 0),
                'is_available': data.get('is_available', True),
                'guide_name': data.get('guide_name', '') or '',
                'itinerary_destinations': itinerary.get('destinations'),
                'itinerary_description': itinerary.get('description', ''),
            },
        )

        # Sync schedules
        schedules = data.get('schedules', [])
        if schedules:
            # Replace all schedules for this trip
            trip.schedules.all().delete()
            for sched in schedules:
                TripSchedule.objects.create(
                    trip=trip,
                    start_date=sched.get('start_date'),
                    end_date=sched.get('end_date'),
                    location=sched.get('location', ''),
                )
    except Exception:
        logger.exception("Failed to sync trip data")


def _sync_booking(data, user):
    """Sync a single Booking from microservice JSON."""
    try:
        booking_id = data.get('booking_id')
        if not booking_id:
            return

        trip_id_ref = data.get('trip_id', '')
        trip_obj = Trip.objects.filter(trip_id=trip_id_ref).first() if trip_id_ref else None

        Booking.objects.update_or_create(
            booking_id=booking_id,
            defaults={
                'user': user,
                'trip': trip_obj,
                'trip_id_ref': trip_id_ref or '',
                'participant_name': data.get('participant_name', ''),
                'status_code': data.get('status_code', 'PENDING'),
                'status_description': data.get('status_description', ''),
                'transaction_id_ref': data.get('transaction_id'),
            },
        )
    except Exception:
        logger.exception("Failed to sync booking data")


def _sync_transaction(data, user):
    """Sync a single Transaction from microservice JSON."""
    try:
        txn_id = data.get('transaction_id')
        if not txn_id:
            return

        booking_id_ref = data.get('booking_id')
        booking_obj = Booking.objects.filter(booking_id=booking_id_ref).first() if booking_id_ref else None

        try:
            amount = Decimal(str(data.get('total_amount', 0)))
        except (InvalidOperation, TypeError, ValueError):
            amount = Decimal('0')

        Transaction.objects.update_or_create(
            transaction_id=txn_id,
            defaults={
                'user': user,
                'booking': booking_obj,
                'booking_id_ref': booking_id_ref,
                'total_amount': amount,
                'payment_status': data.get('payment_status', 'INITIATED'),
                'payment_type': data.get('payment_type'),
                'payment_provider': data.get('payment_provider'),
            },
        )
    except Exception:
        logger.exception("Failed to sync transaction data")


def _sync_response(service_name, path, response_body, user):
    """
    Parse a successful microservice response and save it into the local Django DB.
    This runs *after* the response is already returned to the client so that
    gateway latency is not affected by database writes.
    """
    try:
        data = json.loads(response_body)
    except (json.JSONDecodeError, TypeError):
        return

    path_lower = (path or '').lower().strip('/')

    if service_name == 'planner':
        # Check if this is trip data (trips now managed by planner)
        if path_lower.startswith('trips'):
            # Handle trip sync
            if isinstance(data, list):
                for item in data:
                    _sync_trip(item, user)
            elif isinstance(data, dict) and data.get('trip_id'):
                _sync_trip(data, user)
        else:
            # Regular travel plan data
            if isinstance(data, list):
                for item in data:
                    _sync_travel_plan(item, user)
            elif isinstance(data, dict) and data.get('id'):
                _sync_travel_plan(data, user)

    elif service_name == 'opentrip':
        # Note: trips are no longer handled here (moved to planner)
        if path_lower.startswith('bookings'):
            if isinstance(data, list):
                for item in data:
                    _sync_booking(item, user)
            elif isinstance(data, dict) and data.get('booking_id'):
                _sync_booking(data, user)

        elif path_lower.startswith('transactions'):
            if isinstance(data, list):
                for item in data:
                    _sync_transaction(item, user)
            elif isinstance(data, dict) and data.get('transaction_id'):
                _sync_transaction(data, user)

class GatewayProxyView(APIView):
    """
    Gateway Proxy View to forward requests to microservices
    """
    # Verify user identity via JWT
    permission_classes = [IsAuthenticated]

    # Rate limit per user
    throttle_classes = [UserRateThrottle]

    def dispatch(self, request, *args, **kwargs):
        # Initialize headers dict
        self.headers = {}
        
        try:
            # Wrap the raw WSGIRequest into a DRF Request
            # adds .query_params, .user, .auth, etc.
            request = self.initialize_request(request, *args, **kwargs)
            self.request = request
            self.args = args
            self.kwargs = kwargs
            self.format_kwarg = self.get_format_suffix(**kwargs)

            # Trigger DRF's Auth & Permission checks (including throttling)
            try:
                self.initial(request, *args, **kwargs)
            except Exception as exc:
                response = self.handle_exception(exc)
                self.response = self.finalize_response(request, response, *args, **kwargs)
                return self.response

            # Determine target service
            service_name = kwargs.get('service')
            path = kwargs.get('path', '')
            logger.info(f"[GATEWAY] Processing request: service={service_name}, path={path}, method={request.method}")
        except Exception as e:
            logger.exception(f"[GATEWAY] CRITICAL ERROR in dispatch setup: {type(e).__name__}: {str(e)}")
            return HttpResponse(f"Internal Server Error: {type(e).__name__}", status=500)

        # Cache Key
        query_string = request.META.get('QUERY_STRING', '')
        # include a user-specific component to avoid serving one user's cached response to another authenticated user
        # for anonymous users, use a common cache key without user identifier
        user_identifier = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if user_identifier is not None:
            cache_key = f"gateway:{service_name}:{path}:{query_string}:user:{user_identifier}"
        else:
            cache_key = f"gateway:{service_name}:{path}:{query_string}:anon"
        
        # Only cache safe GET requests for opentrip service
        should_cache = (request.method == 'GET' and service_name == 'opentrip')

        if should_cache:
            try:
                cached_response = cache.get(cache_key)
                if cached_response:
                    response = HttpResponse(
                        cached_response['content'],
                        status=cached_response['status'],
                        content_type=cached_response['content_type']
                    )
                    self.response = self.finalize_response(request, response, *args, **kwargs)
                    return self.response
            except Exception:
                # Cache failure - continue without cache
                pass
        
        if service_name == 'planner':
            base_url = settings.TRAVEL_PLANNER_URL
            # Map external 'planner' to internal 'perencanaan'
            internal_path = f"perencanaan/{path.lstrip('/')}"
            actual_service_name = 'planner'
        elif service_name == 'opentrip':
            # NOTE: Trip management has been moved to Travel Planner microservice
            # Route trip-related requests to Travel Planner instead of Open Trip System
            path_lower = (path or '').lower().strip('/')
            if path_lower.startswith('trips'):
                # Route trip requests to Travel Planner
                base_url = settings.TRAVEL_PLANNER_URL
                internal_path = f"perencanaan/{path.lstrip('/')}"
                # Update service_name for proper sync handling
                actual_service_name = 'planner'
            else:
                # Route bookings, transactions, etc. to Open Trip System
                base_url = settings.OPEN_TRIP_URL
                internal_path = f"opentrip/{path.lstrip('/')}"
                actual_service_name = 'opentrip'
        else:
            response = HttpResponse("Service not found", status=404)
            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        # Track the actual service being called (for sync purposes)
        # Use actual_service_name for data sync operations
        sync_service_name = actual_service_name

        # Construct target URL
        url = f"{base_url}/api/{internal_path}"
        
        # Log request details (use DEBUG for PII/high-volume data)
        logger.info(f"Gateway proxying {request.method} to service: {service_name}")
        logger.debug(f"Target URL: {url}")
        logger.debug(f"User ID: {request.user.id}, Role: {request.user.role}")
        
        # Forward the request
        try:
            # Forward headers, but strip security-sensitive ones
            # Security: Never trust client-provided identity headers to prevent spoofing
            excluded_headers = ['host', 'content-length', 'x-user-id', 'x-user-role']
            headers = {
                key: value for key, value in request.headers.items() 
                if key.lower() not in excluded_headers
            }
            
            # Get headers from original request
            if hasattr(request, '_request') and hasattr(request._request, 'headers'):
                headers = {key: value for key, value in request._request.headers.items() 
                          if key.lower() not in ['host', 'content-length', 'x-user-id', 'x-user-role']}
            
            # Security: Always inject user identity from authenticated server-side context
            # This ensures microservices receive verified user information (never trust client)
            try:
                headers['X-User-ID'] = str(request.user.id)
                headers['X-User-Role'] = request.user.role
                logger.debug(f"User context: ID={headers['X-User-ID']}, Role={headers['X-User-Role']}")
            except Exception as e:
                logger.exception(f"[GATEWAY] ERROR setting user headers: {type(e).__name__}: {str(e)}")
                raise
            
            # Ensure Authorization header is set
            if 'Authorization' not in headers and request.auth:
                headers['Authorization'] = f"Bearer {str(request.auth)}"
            logger.debug(f"Forwarding with user context: ID={headers.get('X-User-ID')}, Role={headers.get('X-User-Role')}, Has Auth: {'Authorization' in headers}")
            
            # Explicitly set Content-Type if provided
            if request.content_type:
                headers['Content-Type'] = request.content_type

            logger.info(f"[GATEWAY] Forwarding {request.method} request to: {url}")
            microservice_response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                data=request.body,
                params=request.query_params.dict(),
                timeout=10
            )
            logger.info(f"[GATEWAY] Received response: status={microservice_response.status_code}")

            # Save to Cache if applicable
            if should_cache and microservice_response.status_code == 200:
                try:
                    cache_data = {
                        'content': microservice_response.content,
                        'status': microservice_response.status_code,
                        'content_type': microservice_response.headers.get('Content-Type')
                    }
                    cache.set(cache_key, cache_data, timeout=60) # 60s cache
                except Exception:
                    # Cache failure - continue without caching
                    pass
            # Log response metadata only (avoid logging sensitive payload data)
            logger.info(
                f"Microservice response: status={microservice_response.status_code}, "
                f"content-type={microservice_response.headers.get('Content-Type')}, "
                f"content-length={len(microservice_response.content)}"
            )
            
            # Only log response body at DEBUG level with content-type restrictions
            if logger.isEnabledFor(logging.DEBUG):
                content_type = microservice_response.headers.get('Content-Type', '')
                # Only sample safe content types (avoid logging binary/sensitive data)
                if 'application/json' in content_type or 'text/' in content_type:
                    logger.debug(f"Response sample: {microservice_response.text[:200]}...")

            # Return microservice response to frontend
            response = HttpResponse(
                microservice_response.content,
                status=microservice_response.status_code,
                content_type=microservice_response.headers.get('Content-Type')
            )

            # Sync successful responses to local Django DB
            if 200 <= microservice_response.status_code < 300:
                try:
                    _sync_response(
                        sync_service_name,  # Use actual service for proper data sync
                        path,
                        microservice_response.content,
                        request.user if request.user.is_authenticated else None,
                    )
                except Exception:
                    logger.exception("Data sync to local DB failed (non-blocking)")

            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        except requests.exceptions.RequestException as e:
            # Log full exception details with stack trace for debugging
            logger.exception(f"Gateway error proxying to {service_name}: {type(e).__name__}")
            # Return generic error message to client (don't leak internal details)
            return HttpResponse("Service temporarily unavailable", status=503)

    def get(self, request, service, path='', *args, **kwargs):
        """Handle GET requests"""
        return self._proxy_request(request, service, path)

    def post(self, request, service, path='', *args, **kwargs):
        """Handle POST requests"""
        return self._proxy_request(request, service, path)

    def put(self, request, service, path='', *args, **kwargs):
        """Handle PUT requests"""
        return self._proxy_request(request, service, path)

    def patch(self, request, service, path='', *args, **kwargs):
        """Handle PATCH requests"""
        return self._proxy_request(request, service, path)

    def delete(self, request, service, path='', *args, **kwargs):
        """Handle DELETE requests"""
        return self._proxy_request(request, service, path)
