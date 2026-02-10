import React from 'react';
import {colors,spacing,radius,fontSize,transitions,fontFamily,} from '../../styles/variables.jsx';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faTag } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { StyledTripCard, GridTripCard } from '../../components/ui/Card.jsx';
import tripExploreBg from '../../assets/images/tripexplorebg.png';
import { trips } from '../../mocks/mockData.js';

export default function AgentTripPage() {
  const navigate = useNavigate();

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
            {trips.map(trip => (
              <GridTripCard
                key={trip.tripId}
                trip={trip}
                onClick={() => navigate(`/trip/edit?tripId=${trip.tripId}`)}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}