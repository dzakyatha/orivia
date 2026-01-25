import React, { useEffect, useState } from 'react';
import Navbar from '../../components/ui/Navbar.jsx';

const HomePage = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  // Determine navbar variant based on role
  // TRAVEL_AGENT sees "Trip", CUSTOMER sees "Explore"
  const navbarVariant = userRole === 'TRAVEL_AGENT' ? 'agent' : 'customer';

  return (
    <div>
      <Navbar variant={navbarVariant} />
      <main style={{ padding: 32 }}>
        <h1>Home</h1>
        <p>Welcome! Your role: {userRole || 'Loading...'}</p>
        <p>Navbar variant: {navbarVariant}</p>
      </main>
    </div>
  );
};

export default HomePage;
