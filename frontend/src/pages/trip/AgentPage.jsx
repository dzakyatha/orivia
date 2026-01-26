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
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';

export default function AgentTripPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <main style={{padding: 24}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{margin: 0}}>Agent Trips</h1>
            <p style={{margin: 0, color: 'rgba(0,0,0,0.6)'}}>Placeholder for agent trip management.</p>
          </div>
          <div>
            <Button
              variant="primary"
              style={{ gap: '8px', minWidth: '200px', minHeight: '40.8px', fontSize: fontSize.xs}}
              onClick={() => navigate('/trip/new')}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span style={{ fontWeight: 500 }}>Add New Trip</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
