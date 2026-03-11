import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faLocationDot, faUsers, faCheck,faChevronDown,faChevronLeft,faChevronRight} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button';
import { TripCard } from '../../components/ui/Card.jsx';
import { colors, spacing, radius, fontSize, fontFamily } from '../../styles/variables';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlannerTrips, fetchPlannerTripDetail } from '../../services/tripService';

const monthNamesID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const formatISODate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = monthNamesID[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatDateRange = (startIso, endIso) => {
  if (!startIso && !endIso) return '';
  if (startIso && endIso) return `${formatISODate(startIso)} - ${formatISODate(endIso)}`;
  return startIso ? formatISODate(startIso) : formatISODate(endIso);
};

const formatRupiah = (value) => {
  if (value == null) return '';
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value));
  } catch (e) {
    return String(value);
  }
};

const formatDurationText = (duration) => {
  if (!duration) return '';
  const parts = [];
  if (typeof duration.days === 'number') parts.push(`${duration.days} Day`);
  if (typeof duration.nights === 'number') parts.push(`${duration.nights} Night`);
  return parts.join(' ');
};

export default function BookingPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [isHover, setIsHover] = useState(false);
  const { id } = useParams();
  const routeId = id ? Number(id) : null;
  
  // State for planner data
  const [trip, setTrip] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadTripData() {
      if (!routeId) {
        setLoading(false);
        setError('No trip ID provided');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // First, fetch all schedules to find the schedule by scheduleId
        console.log('[BookingPage] Loading schedule with ID:', routeId);
        const data = await fetchPlannerTrips();
        
        if (!mounted) return;
        
        const foundSchedule = (data.tripSchedules || []).find(
          s => Number(s.scheduleId) === Number(routeId)
        );
        
        if (!foundSchedule) {
          console.warn('[BookingPage] Schedule not found for ID:', routeId);
          setError('Schedule not found');
          setLoading(false);
          return;
        }
        
        console.log('[BookingPage] Found schedule:', foundSchedule);
        setSchedule(foundSchedule);
        
        // Now fetch the full trip detail using tripId from schedule
        const tripId = foundSchedule.tripId || foundSchedule.trip_id || foundSchedule.id_rencana;
        console.log('[BookingPage] Fetching trip detail for tripId:', tripId);
        
        const tripDetail = await fetchPlannerTripDetail(tripId);
        
        if (!mounted) return;
        
        console.log('[BookingPage] Loaded trip detail:', tripDetail);
        setTrip(tripDetail);
        
      } catch (e) {
        console.error('[BookingPage] Failed to load trip data', e);
        if (mounted) {
          setError('Failed to load trip details');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadTripData();
    return () => { mounted = false; };
  }, [routeId]);
  
  // Prepare data for rendering - directly from trip detail (no fallbacks)
  const TRIP_IMAGES_LOCAL = trip?.images && trip.images.length > 0 
    ? trip.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
    : [];
  const RUNDOWN_DATA_LOCAL = trip?.rundowns || {};
  const INCLUDES_LOCAL = trip?.includes || [];
  const PICKUP_LOCAL = trip?.pickup_points || [];
  
  // Calculate total days from rundowns for dropdown
  const totalDays = Object.keys(RUNDOWN_DATA_LOCAL).length || 1;

  // Reset selectedDay if it exceeds totalDays
  useEffect(() => {
    if (selectedDay > totalDays) {
      setSelectedDay(1);
    }
  }, [totalDays, selectedDay]);

  const prevImage = () => {
    if (TRIP_IMAGES_LOCAL.length === 0) return;
    setImgIndex((i) => (i - 1 + TRIP_IMAGES_LOCAL.length) % TRIP_IMAGES_LOCAL.length);
  };

  const nextImage = () => {
    if (TRIP_IMAGES_LOCAL.length === 0) return;
    setImgIndex((i) => (i + 1) % TRIP_IMAGES_LOCAL.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 50; // px
    if (dx > threshold) {
      nextImage();
    } else if (dx < -threshold) {
      prevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1584715625116-c1dbbfcf19be?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        backgroundColor: colors.bg,        backgroundSize: 'cover',
        backgroundPosition: 'top-center',
        backgroundRepeat: 'no-repeat',
        fontFamily: fontFamily.base
      }}>
      <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing.lg
      }}>
        
        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: spacing.xl,
            color: colors.bg,
            fontSize: fontSize.xl,
            fontWeight: 600
          }}>
            Loading trip details...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            textAlign: 'center',
            padding: spacing.xl,
            color: colors.bg,
            fontSize: fontSize.xl,
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Content - Only show when data is loaded */}
        {!loading && !error && trip && (
        <>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 660px) 1fr',
          gap: spacing.xl,
          marginBottom: spacing.xl
        }}>
          
          {/* LAYOUT 1 - Image (Left) */}
          <div style={{
            position: 'relative',
            borderRadius: radius.lg,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 660,
            height: 600,
            minHeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
              >
              {TRIP_IMAGES_LOCAL.length > 0 ? (
              <img
                src={TRIP_IMAGES_LOCAL[imgIndex]}
                alt={`${trip.name} ${imgIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accent5,
                  color: colors.bg,
                  fontSize: fontSize.xl
                }}>
                  No images available
                </div>
              )}

              {/* Left Arrow */}
              <button
                aria-label="Previous image"
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  background: 'transparent',
                  color: colors.bg,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {/* Right Arrow */}
              <button
                aria-label="Next image"
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  background: 'transparent',
                  color: colors.bg,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>

              {/* Hover overlay for first image */}
              {TRIP_IMAGES_LOCAL.length > 0 && imgIndex === 0 && isHover && (
                <div aria-hidden style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  padding: `${spacing.md}`,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <div style={{ fontSize: fontSize.lg, fontWeight: 700, marginBottom: spacing.xs, paddingLeft: spacing.lg }}>{trip.name}</div>
                  <div style={{ fontSize: fontSize.base, textAlign: 'justify', padding: `${spacing.md} ${spacing.lg} ${spacing.lg} ${spacing.lg}`, lineHeight: 1.45, maxHeight: '40%', overflowY: 'auto' }}>{trip.description}</div>
                </div>
              )}

              {TRIP_IMAGES_LOCAL.length > 0 && imgIndex >= 1 && isHover && (
                <div aria-hidden style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  padding: `${spacing.md}`,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                </div>
              )}

            </div>
          </div>

          {/* LAYOUT 2 - Information (Right) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg
          }}>

            {/* 2.1 Description & Action - title left, price card right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing.lg, alignItems: 'flex-start' }}>
              <div>
                <h1 style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  color: colors.bg,
                  marginBottom: spacing.xs,
                  fontFamily: fontFamily.base,
                  lineHeight: 1.2
                }}>
                  {trip.name}
                </h1>
                <p style={{
                  fontSize: fontSize.xl,
                  color: colors.accent1,
                  fontWeight: 600,
                  marginBottom: spacing.xs
                }}>
                  {(() => {
                    const durStr = formatDurationText(trip.duration);
                    const subtitle = [durStr, trip.destinationType || trip.destination_type].filter(Boolean).join(' • ');
                    return subtitle || 'Trip Details';
                  })()}
                </p>
              </div>

              <div style={{ minWidth: 265, maxWidth: 300 }}>
                <div style={{
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  backgroundColor: colors.bg,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: fontSize.sm,
                    color: colors.accent5,
                    marginBottom: spacing.xs
                  }}>
                    Starting from
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: colors.accent5,
                    marginBottom: spacing.md
                  }}>
                    {formatRupiah(trip?.price ?? trip?.harga)}<span style={{ fontSize: fontSize.lg, fontWeight: 600 }}>/pax</span>
                  </div>
                  <Button 
                    variant="primary" 
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: fontSize.md,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm
                    }}
                    onClick={() => navigate('/explore/booking/checkout/details', { state: { scheduleId: schedule?.scheduleId, tripId: trip?.tripId || trip?.id_rencana || trip?.trip_id } })}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Book Trip
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid: Trip Information + Include / Pick-Up Point + Include */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '0.7fr 0.5fr',
              gridTemplateRows: 'auto auto',
              gap: spacing.lg,
              flex: 1,
              alignItems: 'stretch'
            }}>
              
              {/* 2.2 Trip Information Card (Top Left) */}
              <TripCard style={{
                padding: spacing.lg
              }}>
                <h3 style={{
                  fontSize: fontSize.xl,
                  fontWeight: 700,
                  marginBottom: spacing.md,
                  fontFamily: fontFamily.base,
                  color: colors.accent5
                }}>
                  Trip Information
                </h3>
                <div className="custom-scrollbar" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  maxHeight: '150px',
                  overflowY: 'auto',
                  paddingRight: spacing.sm,
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: fontSize.base }}>
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{schedule ? formatDateRange(schedule.start_date, schedule.end_date) : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: fontSize.base }}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>{`${trip.location?.state || trip.provinsi || '-'}, ${trip.location?.country || trip.negara || '-'}`}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: fontSize.base }}>
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{schedule ? `${schedule.slotAvailable ?? schedule.slot_available ?? '-'} / ${trip?.slot ?? trip?.slot_tersedia ?? '-'} Slots Available` : `${trip?.slot ?? trip?.slot_tersedia ?? '-'} Slots Available`}</span>
                  </div>
                </div>
              </TripCard>

              {/* 2.4 Include Card (Right Side - Spans 2 Rows) */}
              <TripCard style={{
                padding: spacing.md,
                gridRow: 'span 2',
                alignSelf: 'stretch',
                height: '100%',
                boxSizing: 'border-box'
              }}>
                <h3 style={{
                  fontSize: fontSize.xl,
                  fontWeight: 700,
                  marginBottom: spacing.md,
                  fontFamily: fontFamily.base,
                  color: colors.accent5
                }}>
                  Include
                </h3>
                <div className="custom-scrollbar" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingRight: spacing.sm,
                  boxSizing: 'border-box'
                }}>
                  {INCLUDES_LOCAL.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: fontSize.base }}>
                      <FontAwesomeIcon icon={faCheck} style={{ width: 16 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </TripCard>

              {/* 2.3 Pick-Up Point Card (Bottom Left) */}
              <TripCard style={{
                padding: spacing.lg
              }}>
                <h3 style={{
                  fontSize: fontSize.xl,
                  fontWeight: 700,
                  marginBottom: spacing.md,
                  fontFamily: fontFamily.base,
                  color: colors.accent5
                }}>
                  Pick-Up Point
                </h3>
                <div className="custom-scrollbar" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  maxHeight: '100px',
                  overflowY: 'auto',
                  paddingRight: spacing.xs,
                  boxSizing: 'border-box'
                }}>
                  {PICKUP_LOCAL.map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: fontSize.base }}>
                      <FontAwesomeIcon icon={faLocationDot} style={{ width: 16 }} />
                      <span>
                        {typeof point === 'string'
                          ? point
                          : `${point.location || ''}`}
                      </span>
                    </div>
                  ))}
                </div>
              </TripCard>

            </div>
          </div>
        </div>

        {/* Rundown Section */}
        <div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: colors.bg,
            marginBottom: spacing.lg,
            fontFamily: fontFamily.base
          }}>
            Rundown
          </h2>

          {/* Day Selector */}
          <div style={{
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <label style={{
              fontSize: fontSize.lg,
              fontWeight: 600,
              color: colors.bg,
              fontFamily: fontFamily.base
            }}>
              Day
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                style={{
                  backgroundColor: colors.accent5,
                  color: colors.bg,
                  border: 'none',
                  borderRadius: radius.md,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  paddingRight: '40px',
                  fontSize: fontSize.base,
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none',
                  fontFamily: fontFamily.base,
                  outline: 'none'
                }}
              >
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                style={{
                  position: 'absolute',
                  right: spacing.md,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: colors.bg
                }}
              />
            </div>
          </div>

          {/* Rundown Table */}
          <div style={{
            backgroundColor: 'rgba(117, 121, 91, 0.6)',
            borderRadius: radius.lg,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: colors.accent5 }}>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    color: colors.bg,
                    fontSize: fontSize.base,
                    fontWeight: 700,
                    borderBottom: `3px solid ${colors.accent5}`
                  }}>
                    Time
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    color: colors.bg,
                    fontSize: fontSize.base,
                    fontWeight: 700,
                    borderBottom: `3px solid ${colors.accent5}`
                  }}>
                    Duration (hrs)
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    color: colors.bg,
                    fontSize: fontSize.base,
                    fontWeight: 700,
                    borderBottom: `3px solid ${colors.accent5}`
                  }}>
                    Activity
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    color: colors.bg,
                    fontSize: fontSize.base,
                    fontWeight: 700,
                    borderBottom: `3px solid ${colors.accent5}`
                  }}>
                    Location
                  </th>
                </tr>
              </thead>
              <tbody>
                {(RUNDOWN_DATA_LOCAL[selectedDay] || []).map((item, idx) => (
                  <tr key={idx} style={{
                    backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                  }}>
                    <td style={{
                      padding: spacing.md,
                      color: colors.bg,
                      textAlign: 'center',
                      fontSize: fontSize.base,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {item.time}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      color: colors.bg,
                      textAlign: 'center',
                      fontSize: fontSize.base,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {item.duration}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      color: colors.bg,
                      textAlign: 'center',
                      fontSize: fontSize.base,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {item.activity}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      color: colors.bg,
                      textAlign: 'center',
                      fontSize: fontSize.base,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {item.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div style={{ height: spacing.xl }} />
        </>
        )}
      </div>
      </div>
  );
}
