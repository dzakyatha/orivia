from django.contrib import admin
from .models import (
    TravelPlan, TravelDay, Activity, Expense,
    Trip, TripSchedule, Booking, Transaction,
)


# =============================================
# Inlines
# =============================================

class TravelDayInline(admin.TabularInline):
    model = TravelDay
    extra = 0
    show_change_link = True


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 0


class ExpenseInline(admin.TabularInline):
    model = Expense
    extra = 0


class TripScheduleInline(admin.TabularInline):
    model = TripSchedule
    extra = 0


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    fields = ('transaction_id', 'total_amount', 'payment_status', 'payment_type', 'payment_provider')
    readonly_fields = ('transaction_id',)


# =============================================
# Travel Planner Admin
# =============================================

@admin.register(TravelPlan)
class TravelPlanAdmin(admin.ModelAdmin):
    list_display = ('nama', 'get_user', 'durasi_mulai', 'durasi_selesai', 'anggaran_display', 'synced_at')
    list_filter = ('anggaran_mata_uang', 'durasi_mulai')
    search_fields = ('nama', 'user__email', 'user__username')
    readonly_fields = ('id', 'synced_at')
    inlines = [TravelDayInline, ExpenseInline]

    fieldsets = (
        (None, {'fields': ('id', 'user', 'nama')}),
        ('Durasi', {'fields': ('durasi_mulai', 'durasi_selesai')}),
        ('Anggaran', {'fields': ('anggaran_jumlah', 'anggaran_mata_uang')}),
        ('Metadata', {'fields': ('synced_at',)}),
    )

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.user.email if obj.user else '—'

    @admin.display(description='Anggaran')
    def anggaran_display(self, obj):
        return f"{obj.anggaran_jumlah:,.0f} {obj.anggaran_mata_uang}"


@admin.register(TravelDay)
class TravelDayAdmin(admin.ModelAdmin):
    list_display = ('tanggal', 'get_plan_name', 'get_activity_count')
    list_filter = ('tanggal',)
    search_fields = ('plan__nama',)
    readonly_fields = ('id',)
    inlines = [ActivityInline]

    @admin.display(description='Rencana')
    def get_plan_name(self, obj):
        return obj.plan.nama

    @admin.display(description='Jumlah Aktivitas')
    def get_activity_count(self, obj):
        return obj.activities.count()


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('deskripsi', 'waktu_mulai', 'waktu_selesai', 'lokasi_nama', 'get_day_date')
    search_fields = ('deskripsi', 'lokasi_nama')
    readonly_fields = ('id',)

    @admin.display(description='Tanggal Hari')
    def get_day_date(self, obj):
        return obj.day.tanggal


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('deskripsi', 'biaya_display', 'tanggal_pengeluaran', 'get_plan_name')
    list_filter = ('biaya_mata_uang', 'tanggal_pengeluaran')
    search_fields = ('deskripsi', 'plan__nama')
    readonly_fields = ('id',)

    @admin.display(description='Rencana')
    def get_plan_name(self, obj):
        return obj.plan.nama

    @admin.display(description='Biaya')
    def biaya_display(self, obj):
        return f"{obj.biaya_jumlah:,.0f} {obj.biaya_mata_uang}"


# =============================================
# Open-Trip Admin
# =============================================

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_name', 'trip_id', 'get_user', 'capacity', 'is_available', 'guide_name', 'synced_at')
    list_filter = ('is_available',)
    search_fields = ('trip_name', 'trip_id', 'guide_name', 'user__email')
    readonly_fields = ('trip_id', 'synced_at')
    inlines = [TripScheduleInline]

    fieldsets = (
        (None, {'fields': ('trip_id', 'user', 'trip_name', 'capacity', 'is_available')}),
        ('Guide', {'fields': ('guide_name',)}),
        ('Itinerary', {'fields': ('itinerary_destinations', 'itinerary_description')}),
        ('Metadata', {'fields': ('synced_at',)}),
    )

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.user.email if obj.user else '—'


@admin.register(TripSchedule)
class TripScheduleAdmin(admin.ModelAdmin):
    list_display = ('location', 'start_date', 'end_date', 'get_trip_name')
    list_filter = ('start_date',)
    search_fields = ('location', 'trip__trip_name')

    @admin.display(description='Trip')
    def get_trip_name(self, obj):
        return obj.trip.trip_name


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'participant_name', 'get_user', 'get_trip_name', 'status_code', 'synced_at')
    list_filter = ('status_code',)
    search_fields = ('booking_id', 'participant_name', 'user__email', 'trip__trip_name')
    readonly_fields = ('booking_id', 'synced_at')
    inlines = [TransactionInline]

    fieldsets = (
        (None, {'fields': ('booking_id', 'user', 'trip', 'trip_id_ref')}),
        ('Peserta', {'fields': ('participant_name',)}),
        ('Status', {'fields': ('status_code', 'status_description')}),
        ('Referensi', {'fields': ('transaction_id_ref',)}),
        ('Metadata', {'fields': ('synced_at',)}),
    )

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.user.email if obj.user else '—'

    @admin.display(description='Trip')
    def get_trip_name(self, obj):
        return obj.trip.trip_name if obj.trip else obj.trip_id_ref or '—'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'get_user', 'total_amount', 'payment_status', 'payment_type', 'payment_provider', 'synced_at')
    list_filter = ('payment_status', 'payment_type')
    search_fields = ('transaction_id', 'user__email', 'booking__booking_id')
    readonly_fields = ('transaction_id', 'synced_at')

    fieldsets = (
        (None, {'fields': ('transaction_id', 'user', 'booking', 'booking_id_ref')}),
        ('Pembayaran', {'fields': ('total_amount', 'payment_status', 'payment_type', 'payment_provider')}),
        ('Metadata', {'fields': ('synced_at',)}),
    )

    @admin.display(description='User')
    def get_user(self, obj):
        return obj.user.email if obj.user else '—'
