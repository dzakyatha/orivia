import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import RoleSelectionPage from './pages/auth/RoleSelectionPage.jsx';
import LandingPage from './pages/home/LandingPage.jsx';
import HomePage from './pages/home/HomePage.jsx';
import AgentPage from './pages/home/AgentPage.jsx';
import CustomerPage from './pages/home/CustomerPage.jsx';
import AgentProfilePage from './pages/profile/AgentProfilePage.jsx';
import CustomerProfilePage from './pages/profile/CustomerProfilePage.jsx';
import AgentTripPage from './pages/trip/AgentPage.jsx';
import NewTripPage from './pages/trip/NewTripPage.jsx';
import TripEditPage from './pages/trip/TripEditPage.jsx';
import ParticipantPage from './pages/trip/ParticipantPage.jsx';
import CustomerExplorePage from './pages/explore/CustomerPage.jsx';
import CustomerBookingPage from './pages/explore/BookingPage.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/profile/agent" element={<AgentProfilePage />} />
        <Route path="/profile/customer" element={<CustomerProfilePage />} />
        <Route path="/trip/agent" element={<AgentTripPage />} />
        <Route path="/trip/new" element={<NewTripPage />} />
        <Route path="/trip/edit" element={<TripEditPage />} />
        <Route path="/trip/participant" element={<ParticipantPage />} />
        <Route path="/explore/customer" element={<CustomerExplorePage />} />
        <Route path="/explore/booking" element={<CustomerBookingPage />} />
        <Route path="/explore/booking/:id" element={<CustomerBookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
