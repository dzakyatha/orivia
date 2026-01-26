import React from 'react';
import { spacing, fontFamily } from '../../styles/variables.jsx';
import Navbar, { TripTabs } from '../../components/ui/Navbar.jsx';

export default function ParticipantPage() {
  const styles = {
    page: { minHeight: '100vh', fontFamily: fontFamily?.base || 'inherit' },
    main: { padding: spacing?.lg || 24, maxWidth: '1278px', margin: '0 auto', boxSizing: 'border-box' },
    placeholder: { padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(8,15,20,0.06)' },
  };

  return (
    <div style={styles.page}>
      <Navbar style={{ background: 'transparent' }} />
      <main style={styles.main}>
        <TripTabs />
        <div style={styles.placeholder}>
          <h2>Participant Management</h2>
          <p>This is the ParticipantPage placeholder. Replace with participant UI.</p>
        </div>
      </main>
    </div>
  );
}
