import React from 'react';
import {
  colors,
  spacing,
  radius,
  fontSize,
  transitions,
  fontFamily,
} from '../../styles/variables.jsx';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faTag } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { StyledTripCard } from '../../components/ui/Card.jsx';
import tripExploreBg from '../../assets/images/tripexplorebg.png';

export default function AgentTripPage() {
  const navigate = useNavigate();

  const dummyTrips = [
    {
      title: '2D3N - Banda Neira',
      location: 'Maluku, Indonesia',
      price: 'Rp4.575.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '2D1N - Labuan Bajo',
      location: 'East Nusa Tenggara, Indonesia',
      price: 'Rp4.575.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '3D2N - Raja Ampat',
      location: 'Maluku, Indonesia',
      price: 'Rp4.575.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '4D3N - Lake Toba',
      location: 'North Sumatra, Indonesia',
      price: 'Rp4.575.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '2D1N - Merbabu',
      location: 'Central Java, Indonesia',
      price: 'Rp1.500.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '5D6N - Carstensz Pyramid',
      location: 'Central Papua, Indonesia',
      price: 'Rp20.000.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '3D2N - Kerinci',
      location: 'West Sumatra, Indonesia',
      price: 'Rp2.240.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1600&q=60',
    },
    {
      title: '2D1N - Kawah Ijen',
      location: 'East Java, Indonesia',
      price: 'Rp4.575.000,00',
      pax: '15 pax',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=60',
    },
  ];

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#1A1F1D',
      backgroundImage: `url(${tripExploreBg})`,
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
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
      maxWidth: '1278px',
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: colors?.dark || '#10323a',
    },
    subtitle: {
      margin: 0,
      color: 'rgba(0,0,0,0.55)',
      fontSize: 13,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 306px)',
      gap: 18,
      justifyContent: 'center',
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: radius?.lg || 12,
      minHeight: 240,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06))',
      boxShadow: '0 6px 18px rgba(8,15,20,0.12)',
      transition: `transform ${transitions?.normal || '200ms'} ease, box-shadow ${transitions?.normal || '200ms'} ease`,
      cursor: 'pointer',
    },
    cardHover: {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 30px rgba(8,15,20,0.18)',
    },
    cardImage: {
      position: 'absolute',
      inset: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(0.9) contrast(0.95)',
    },
    cardOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '55%',
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
    },
    cardContent: {
      position: 'absolute',
      left: 16,
      bottom: 16,
      right: 16,
      color: '#fff',
      zIndex: 2,
    },
    cardTitle: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '1.1',
      minHeight: 40,
    },
    cardSub: {
      margin: '6px 0 10px 0',
      fontSize: 12,
      opacity: 0.95,
    },
    cardMeta: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      fontSize: 12,
      color: 'rgba(255,255,255,0.95)',
    },
    metaItem: {
      display: 'inline-flex',
      gap: 8,
      alignItems: 'center',
      opacity: 0.95,
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
              style={{ gap: '8px', minWidth: '200px', minHeight: '40.8px', fontSize: fontSize.xs }}
              onClick={() => navigate('/trip/new')}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span style={{ fontWeight: 500 }}>Add New Trip</span>
            </Button>
          </div>
        </div>

        <section style={styles.grid}>
          {dummyTrips.map((trip, idx) => (
            <StyledTripCard
              key={idx}
              image={trip.image}
              title={trip.title}
              location={trip.location}
              price={trip.price}
              pax={trip.pax}
              // DUMMYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY buat cek card 1 ya
              onClick={trip.title === '2D3N - Banda Neira' ? () => navigate('/trip/edit') : undefined}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
