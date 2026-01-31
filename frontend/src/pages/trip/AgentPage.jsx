import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faCalendar, faUsers, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button';
import { GridTripCard, SearchFiltersCard } from '../../components/ui/Card.jsx';
import { colors, spacing, radius, fontSize, fontFamily } from '../../styles/variables';

// Sample trip data
const TRIP_DATA = [
  {
    id: 1,
    name: 'Komodo Island',
    location: { state: 'East Nusa Tenggara', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4575000,
    pax: 15,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration'
  },
  {
    id: 2,
    name: 'Raja Ampat',
    location: { state: 'Maluku', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4175000,
    pax: 15,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration'
  },
  {
    id: 3,
    name: 'Lake Toba',
    location: { state: 'North Sumatra', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4575000,
    pax: 15,
    duration: { days: 4, nights: 3 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'City Tour',
    destinationType: 'City Tour'
  },
  {
    id: 4,
    name: 'Bromo Tengger',
    location: { state: 'East Java', country: 'Indonesia' },
    date: { start_date: '2026-02-05', end_date: '2026-02-07' },
    price: 3250000,
    pax: 12,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'Mount Hiking',
    destinationType: 'Mount Hiking'
  },
  {
    id: 5,
    name: 'Belitung Island',
    location: { state: 'Bangka Belitung', country: 'Indonesia' },
    date: { start_date: '2026-02-10', end_date: '2026-02-12' },
    price: 2800000,
    pax: 20,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration'
  },
  {
    id: 6,
    name: 'Wakatobi Diving',
    location: { state: 'Southeast Sulawesi', country: 'Indonesia' },
    date: { start_date: '2026-02-15', end_date: '2026-02-19' },
    price: 6500000,
    pax: 10,
    duration: { days: 5, nights: 4 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Wildlife Exploration',
    destinationType: 'Wildlife Exploration'
  }
];

const DESTINATION_TYPES = [
  'Island Exploration',
  'Mount Hiking',
  'Camping Ground',
  'City Tour',
  'Wildlife Exploration',
  'Other'
];

export default function CustomerExplorePage() {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDays, setSelectedDays] = useState('');
  const [selectedNights, setSelectedNights] = useState('');
  // start/end/location/pax are editable but not applied until Search is clicked
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [pax, setPax] = useState('');
  const [appliedFilters, setAppliedFilters] = useState(null);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Filter trips by price range
  const filteredPrice = TRIP_DATA.filter((trip) => {
    const price = Number(trip.price || 0);
    const min = Number(priceRange?.[0] ?? -Infinity);
    const max = Number(priceRange?.[1] ?? Infinity);
    return price >= min && price <= max;
  });

  // Filter trips based on destination types and duration (applied on price-filtered set)
  // Note: startDate/endDate/location/pax are only applied when `appliedFilters` is set (Search clicked)
  const filteredTrips = filteredPrice.filter((trip) => {
    // destination type filter
    if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes(trip.destinationType)) {
      return false;
    }

    // duration filter: treat selectedDays/selectedNights as minimum required
    const tripDays = Number(trip.duration?.days ?? 0);
    const tripNights = Number(trip.duration?.nights ?? 0);
    const minDays = Number(selectedDays ?? 0);
    const minNights = Number(selectedNights ?? 0);

    if (!Number.isNaN(minDays) && tripDays < minDays) return false;
    if (!Number.isNaN(minNights) && tripNights < minNights) return false;

    // If Search hasn't been clicked, don't apply date/pax/location filters
    if (!appliedFilters) return true;

    const { startDate: aStart, endDate: aEnd, location: aLocation, pax: aPax } = appliedFilters || {};

    // Pax filter: require trip to have capacity >= requested pax
    if (aPax !== undefined && aPax !== null && aPax !== '') {
      if (Number(trip.pax || 0) < Number(aPax)) return false;
    }

    // Location filter: match against state or country (case-insensitive, substring)
    if (aLocation && aLocation.trim() !== '') {
      const needle = aLocation.trim().toLowerCase();
      const hay = `${trip.location?.state ?? ''} ${trip.location?.country ?? ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }

    // Date overlap filter: require trip dates to overlap requested range
    if (aStart || aEnd) {
      const rqStart = aStart ? new Date(aStart) : null;
      const rqEnd = aEnd ? new Date(aEnd) : null;

      const tripStart = trip.date?.start_date ? new Date(trip.date.start_date) : null;
      const tripEnd = trip.date?.end_date ? new Date(trip.date.end_date) : null;

      if (tripStart && tripEnd) {
        if (rqStart && rqEnd) {
          // overlap if tripStart <= rqEnd AND tripEnd >= rqStart
          if (!(tripStart <= rqEnd && tripEnd >= rqStart)) return false;
        } else if (rqStart && !rqEnd) {
          if (tripEnd < rqStart) return false;
        } else if (!rqStart && rqEnd) {
          if (tripStart > rqEnd) return false;
        }
      }
    }

    return true;
  });

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',      
      backgroundColor: colors.accent1,
      backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=90&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: fontFamily.base
    }}>
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Container */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing.lg,
        display: 'grid',
        gridTemplateColumns: '290px 1fr',
        gap: spacing.xl,
        alignItems: 'start'
      }}>
        
        {/* LEFT PANEL - Filter Section (Fixed) */}
        <div style={{
          position: 'sticky',
          top: '100px',
          backgroundColor: 'rgba(85, 87, 62, 0.95)',
          borderRadius: radius.lg,
          padding: spacing.lg,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Price Range */}
          <div style={{ marginBottom: spacing.xl }}>
            <h3 style={{ 
              color: colors.bg, 
              fontSize: fontSize.lg, 
              fontWeight: 700,
              marginBottom: spacing.md,
              fontFamily: fontFamily.base
            }}>
              Price Range
            </h3>
            <input
              type="range"
              min="500000"
              max="10000000"
              step="100000"
              value={priceRange?.[0] ?? 500000}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange?.[1] ?? 10000000])}
              style={{
                width: '100%',
                marginBottom: spacing.sm,
                accentColor: colors.accent3
              }}
            />
            <input
              type="range"
              min="500000"
              max="10000000"
              step="100000"
              value={priceRange?.[1] ?? 10000000}
              onChange={(e) => setPriceRange([priceRange?.[0] ?? 500000, Number(e.target.value)])}
              style={{
                width: '100%',
                marginBottom: spacing.sm,
                accentColor: colors.accent3
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              color: colors.bg,
              fontSize: fontSize.sm,
              fontWeight: 600
            }}>
              <span>{priceRange ? formatPrice(priceRange[0]) : 'Rp 0'}</span>
              <span>-</span>
              <span>{priceRange ? formatPrice(priceRange[1]) : 'Rp 0'}</span>
            </div>
          </div>

          {/* Destination Type */}
          <div style={{ marginBottom: spacing.xl }}>
            <h3 style={{ 
              color: colors.bg, 
              fontSize: fontSize.lg, 
              fontWeight: 700,
              marginBottom: spacing.md,
              fontFamily: fontFamily.base
            }}>
              Destination Type
            </h3>
            {DESTINATION_TYPES.map(type => (
              <label key={type} style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm,
                cursor: 'pointer',
                color: colors.bg,
                fontSize: fontSize.sm
              }}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: colors.accent3
                  }}
                />
                {type}
              </label>
            ))}
          </div>

          {/* Duration */}
          <div>
            <h3 style={{ 
              color: colors.bg, 
              fontSize: fontSize.lg, 
              fontWeight: 700,
              marginBottom: spacing.md,
              fontFamily: fontFamily.base
            }}>
              Duration
            </h3>
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'nowrap', alignItems: 'center' }}>
              <div style={{
                backgroundColor: colors.accent3,
                color: colors.bg,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: radius.md,
                fontSize: fontSize.sm,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                flex: '0 0 auto',
                paddingLeft: '25px'
              }}>
                <span>Day :</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={selectedDays}
                  onChange={(e) => {
                    let v = parseInt(e.target.value || '0', 10);
                    if (Number.isNaN(v)) v = 0;
                    if (v < 0) v = 0;
                    setSelectedDays(v);
                  }}
                  style={{
                    width: 40,
                    padding: '2px 6px',
                    borderRadius: radius.sm || 6,
                    border: 'none',
                    fontSize: fontSize.sm,
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    color: colors.bg
                  }}
                />
              </div>

              <div style={{
                backgroundColor: colors.accent3,
                color: colors.bg,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: radius.md,
                fontSize: fontSize.sm,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                flex: '0 0 auto',
                 paddingLeft: '25px'
              }}>
                <span>Night :</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={selectedNights}
                  onChange={(e) => {
                    let v = parseInt(e.target.value || '0', 10);
                    if (Number.isNaN(v)) v = 0;
                    if (v < 0) v = 0;
                    setSelectedNights(v);
                  }}
                  style={{
                    width: 40,
                    padding: '2px 6px',
                    borderRadius: radius.sm || 6,
                    border: 'none',
                    fontSize: fontSize.sm,
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    color: colors.bg
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          
          {/* SEARCH SECTION (extracted) */}
          <SearchFiltersCard
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            location={location}
            setLocation={setLocation}
            pax={pax}
            setPax={setPax}
            onSearch={() => setAppliedFilters({ startDate, endDate, location, pax })}
            onClear={() => {
              setAppliedFilters(null);
              setStartDate('');
              setEndDate('');
              setLocation('');
              setPax('');
              setSelectedTypes([]);
              setPriceRange(null);
              setSelectedDays('');
              setSelectedNights('');
            }}
          />

          {/* CARD GRID SECTION (Scrollable) */}
          <div className="cards-scroll">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: spacing.lg
            }}>
              {filteredTrips.map(trip => (
                <GridTripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => { if (trip.id === 1) navigate('/explore/booking'); }}
                />
              ))}
            </div>
            <div style={{ height: 100 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
