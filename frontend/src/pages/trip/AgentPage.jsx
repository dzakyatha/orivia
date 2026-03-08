import React, { useEffect, useState } from 'react';
import {colors,spacing,radius,fontSize,transitions,fontFamily,} from '../../styles/variables.jsx';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faTag } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { StyledTripCard, GridTripCard } from '../../components/ui/Card.jsx';
import tripExploreBg from '../../assets/images/tripexplorebg.png';
import { fetchPlannerTrips } from '../../services/tripService.js';

export default function AgentTripPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchPlannerTrips();
        if (!mounted) return;
        
        // Ensure all trips have valid tripId before setting state
        const validTrips = (res.trips || []).filter(trip => {
          const hasValidId = trip.tripId || trip.trip_id || trip.id_rencana;
          if (!hasValidId) {
            console.warn('[AgentPage] Trip missing ID, filtering out:', trip);
          }
          return hasValidId;
        }).map(trip => {
          // Normalize tripId field to ensure consistency
          return {
            ...trip,
            tripId: trip.tripId || trip.trip_id || trip.id_rencana
          };
        });
        
        console.log('[AgentPage] Loaded trips:', validTrips.length, validTrips);
        setTrips(validTrips);
      } catch (e) {
        console.error('Failed to fetch planner trips', e);
        if (mounted) setTrips([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const styles = {
    page: {
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#1A1F1D',
      backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=90&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: fontFamily?.base || 'inherit',
    },
    main: {
      padding: 24,
      maxWidth: '1326px',
      boxSizing: 'border-box',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 32px)',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
      maxWidth: '1278px',
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    title: {
      margin: 0,
      fontSize: 36,
      fontWeight: 800,
      color: colors.accent5,
      letterSpacing: '0.2px'
    },
    subtitle: {
      margin: '6px 0 0 0',
      color: colors.accent5 ,
      fontSize: 16,
      fontWeight: 600,
      opacity: 0.95
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
      gap: 12,
      width: '100%',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trips</h1>
            <p style={styles.subtitle}>Manage your trips and packages</p>
          </div>
          <div>
            <Button
              variant="primary"
              style={{minWidth: '200px', minHeight: '40.8px', fontSize: fontSize.xs }}
              onClick={() => navigate('/trip/new')}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span style={{ fontWeight: 500, fontFamily: fontFamily.base }}>Add New Trip</span>
            </Button>
          </div>
        </div>

        <div className="cards-scroll" style={{ flex: 1, overflowX: 'hidden' }}>
          <section style={{ ...styles.grid, width: '100%', overflow: 'visible', marginTop: spacing.md }}>
            {loading ? (
              <div style={{ color: colors.accent5 }}>Loading trips...</div>
            ) : trips.length === 0 ? (
              <div style={{ color: colors.accent5 }}>No trips available. Create your first trip!</div>
            ) : (
              trips.map(trip => {
                const tripId = trip.tripId || trip.trip_id || trip.id_rencana;
                return (
                  <GridTripCard
                    key={tripId}
                    trip={trip}
                    onClick={() => {
                      console.log('[AgentPage] Card clicked. Trip:', { 
                        tripId, 
                        name: trip.name, 
                        trip_name: trip.trip_name 
                      });
                      if (!tripId) {
                        console.error('[AgentPage] Trip ID is missing!', trip);
                        alert('Cannot open trip: Trip ID is missing');
                        return;
                      }
                      navigate(`/trip/edit?tripId=${tripId}`);
                    }}
                  />
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

