import uuid
import json
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


# =============================================
# Travel Planner Models (mirrors travel_planner)
# =============================================

class TravelPlan(models.Model):
    """Rencana Perjalanan — aggregate root dari travel_planner."""
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='travel_plans',
        null=True, blank=True,
    )
    nama = models.CharField("Nama Rencana", max_length=255)
    durasi_mulai = models.DateField("Tanggal Mulai")
    durasi_selesai = models.DateField("Tanggal Selesai")
    anggaran_jumlah = models.FloatField("Anggaran (jumlah)")
    anggaran_mata_uang = models.CharField("Mata Uang", max_length=10, default="IDR")
    synced_at = models.DateTimeField("Terakhir Disinkronkan", auto_now=True)

    class Meta:
        verbose_name = "Rencana Perjalanan"
        verbose_name_plural = "Rencana Perjalanan"
        ordering = ["-synced_at"]

    def __str__(self):
        return f"{self.nama} ({self.durasi_mulai} – {self.durasi_selesai})"


class TravelDay(models.Model):
    """Hari Perjalanan — entity anak dari TravelPlan."""
    id = models.UUIDField(primary_key=True)
    plan = models.ForeignKey(
        TravelPlan,
        on_delete=models.CASCADE,
        related_name='days',
    )
    tanggal = models.DateField("Tanggal")

    class Meta:
        verbose_name = "Hari Perjalanan"
        verbose_name_plural = "Hari Perjalanan"
        ordering = ["tanggal"]
        unique_together = [("plan", "tanggal")]

    def __str__(self):
        return f"Hari {self.tanggal} — {self.plan.nama}"


class Activity(models.Model):
    """Aktivitas dalam satu hari perjalanan."""
    id = models.UUIDField(primary_key=True)
    day = models.ForeignKey(
        TravelDay,
        on_delete=models.CASCADE,
        related_name='activities',
    )
    waktu_mulai = models.TimeField("Waktu Mulai")
    waktu_selesai = models.TimeField("Waktu Selesai")
    deskripsi = models.CharField("Deskripsi", max_length=500)
    lokasi_nama = models.CharField("Nama Lokasi", max_length=255, blank=True, default="")
    lokasi_alamat = models.CharField("Alamat", max_length=500, blank=True, default="")
    lokasi_latitude = models.FloatField("Latitude", null=True, blank=True)
    lokasi_longitude = models.FloatField("Longitude", null=True, blank=True)

    class Meta:
        verbose_name = "Aktivitas"
        verbose_name_plural = "Aktivitas"
        ordering = ["waktu_mulai"]

    def __str__(self):
        return f"{self.deskripsi} ({self.waktu_mulai}–{self.waktu_selesai})"


class Expense(models.Model):
    """Pengeluaran dalam rencana perjalanan."""
    id = models.UUIDField(primary_key=True)
    plan = models.ForeignKey(
        TravelPlan,
        on_delete=models.CASCADE,
        related_name='expenses',
    )
    deskripsi = models.CharField("Deskripsi", max_length=500)
    tanggal_pengeluaran = models.DateField("Tanggal Pengeluaran")
    biaya_jumlah = models.FloatField("Biaya (jumlah)")
    biaya_mata_uang = models.CharField("Mata Uang", max_length=10, default="IDR")

    class Meta:
        verbose_name = "Pengeluaran"
        verbose_name_plural = "Pengeluaran"
        ordering = ["tanggal_pengeluaran"]

    def __str__(self):
        return f"{self.deskripsi} — {self.biaya_jumlah} {self.biaya_mata_uang}"


# =============================================
# Open-Trip Models (mirrors open-trip-system)
# =============================================

def validate_itinerary_destinations(value):
    """
    Basic validator for the `itinerary_destinations` JSONField.

    Acceptable values:
    - None
    - a Python dict (object) or list (array)
    - a JSON-formatted string that decodes to a dict or list

    The gateway mirrors data from the open-trip microservice; this
    validator prevents storing primitive strings/numbers and helps catch
    obviously malformed payloads early. For full schema validation,
    consider adding `jsonschema` checks or moving strict validation to
    the open-trip service.
    """
    if value is None:
        return
    # If the value is a string, try to parse it as JSON
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except Exception as e:
            raise ValidationError(f"itinerary_destinations must be valid JSON (decode error: {e})")
        value = parsed

    # Now value should be a dict or list
    if not isinstance(value, (dict, list)):
        raise ValidationError("itinerary_destinations must be a JSON object or array")


class Trip(models.Model):
    """Trip — aggregate root dari open-trip-system.

    Expected `itinerary_destinations` shape
    - Typically a list or object describing destinations used by the
      frontend (e.g. an array of destination objects or a dictionary with
      routing info). This field may be null/blank, but when present it
      must be valid JSON (object or array). Use `validate_itinerary_destinations`
      to enforce this at save-time.
    """
    trip_id = models.CharField("Trip ID", max_length=100, primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips',
        null=True, blank=True,
    )
    trip_name = models.CharField("Nama Trip", max_length=255)
    capacity = models.PositiveIntegerField("Kapasitas")
    is_available = models.BooleanField("Tersedia?", default=True)
    guide_name = models.CharField("Guide", max_length=255, blank=True, default="")
    itinerary_destinations = models.JSONField(
        "Destinasi Itinerary",
        blank=True,
        null=True,
        validators=[validate_itinerary_destinations],
    )
    itinerary_description = models.TextField("Deskripsi Itinerary", blank=True, default="")
    synced_at = models.DateTimeField("Terakhir Disinkronkan", auto_now=True)

    class Meta:
        verbose_name = "Trip"
        verbose_name_plural = "Trips"
        ordering = ["-synced_at"]

    def __str__(self):
        return f"{self.trip_name} (kapasitas: {self.capacity})"


class TripSchedule(models.Model):
    """Jadwal trip."""
    id = models.AutoField(primary_key=True)
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='schedules',
    )
    start_date = models.DateField("Tanggal Mulai")
    end_date = models.DateField("Tanggal Selesai")
    location = models.CharField("Lokasi", max_length=500)

    class Meta:
        verbose_name = "Jadwal Trip"
        verbose_name_plural = "Jadwal Trip"
        ordering = ["start_date"]

    def __str__(self):
        return f"{self.location} ({self.start_date} – {self.end_date})"


class Booking(models.Model):
    """Booking — aggregate root dari open-trip-system."""
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
        ("REFUND_REQUESTED", "Refund Requested"),
    ]

    booking_id = models.CharField("Booking ID", max_length=100, primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True, blank=True,
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.SET_NULL,
        related_name='bookings',
        null=True, blank=True,
    )
    trip_id_ref = models.CharField("Trip ID (ref)", max_length=100, blank=True, default="")
    participant_name = models.CharField("Nama Peserta", max_length=255)
    status_code = models.CharField("Status", max_length=30, choices=STATUS_CHOICES, default="PENDING")
    status_description = models.TextField("Deskripsi Status", blank=True, default="")
    transaction_id_ref = models.CharField("Transaction ID (ref)", max_length=100, blank=True, null=True)
    synced_at = models.DateTimeField("Terakhir Disinkronkan", auto_now=True)

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ["-synced_at"]

    def __str__(self):
        return f"Booking {self.booking_id} — {self.participant_name} ({self.status_code})"


class Transaction(models.Model):
    """Transaction — aggregate root dari open-trip-system."""
    PAYMENT_STATUS_CHOICES = [
        ("INITIATED", "Initiated"),
        ("PENDING", "Pending"),
        ("VALIDATED", "Validated"),
        ("CONFIRMED", "Confirmed"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    transaction_id = models.CharField("Transaction ID", max_length=100, primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
        null=True, blank=True,
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        related_name='transactions',
        null=True, blank=True,
    )
    booking_id_ref = models.CharField("Booking ID (ref)", max_length=100, blank=True, null=True)
    total_amount = models.DecimalField("Total Pembayaran", max_digits=14, decimal_places=2, default=0)
    payment_status = models.CharField("Status Pembayaran", max_length=30, choices=PAYMENT_STATUS_CHOICES, default="INITIATED")
    payment_type = models.CharField("Tipe Pembayaran", max_length=50, blank=True, null=True)
    payment_provider = models.CharField("Provider Pembayaran", max_length=100, blank=True, null=True)
    synced_at = models.DateTimeField("Terakhir Disinkronkan", auto_now=True)

    class Meta:
        verbose_name = "Transaksi"
        verbose_name_plural = "Transaksi"
        ordering = ["-synced_at"]

    def __str__(self):
        return f"Txn {self.transaction_id} — {self.total_amount} ({self.payment_status})"
