import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCircleUser, faDownload, faCheck, faXmark, faEdit } from '@fortawesome/free-solid-svg-icons';
import { spacing, fontFamily, colors, radius, fontSize } from '../../styles/variables.jsx';
import Navbar, { TripTabs } from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import extendAgentBg from '../../assets/images/extendagentbg.jpg';


export default function ParticipantPage() {
  const passengerSample = Array.from({ length: 13 }).map((_, i) => {
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    return {
      username: gender === 'Female' ? 'nakeiiiiii23' : `jekiiiii23${i}`,
      fullname: 'siapa siapa siapa siapa',
      gender,
      dob: '07 Mar 2005',
      nationality: 'Indonesia',
      pickup: i % 3 === 0 ? 'Orivia Agent Gambir, Jakarta' : i % 3 === 1 ? 'Orivia Agent Pasteur, Bandung' : 'Soekarno Hatta Airport, Jakarta',
      phone: '08123456789'
    };
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const openPassengerModal = (p) => {
    setSelectedPassenger(p);
    setModalOpen(true);
  };

  const closePassengerModal = () => {
    setSelectedPassenger(null);
    setModalOpen(false);
  };

  // helper to calculate age (years) from a DOB string
  const calculateAge = (dobStr) => {
    if (!dobStr) return '-';
    const d = new Date(dobStr);
    if (isNaN(d)) return '-';
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  // export passenger list as CSV
  const downloadCSV = (rows) => {
    if (!rows || !rows.length) return;
    const headers = ['Username', 'Full Name', 'Gender', 'Age', 'Pick Up Point', 'Phone Number'];
    const csvRows = [headers.join(',')];
    rows.forEach((r) => {
      const vals = [
        r.username,
        r.fullname,
        r.gender,
        calculateAge(r.dob),
        r.pickup,
        r.phone,
      ];
      const escaped = vals.map((v) => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(escaped.join(','));
    });
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passengers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const page = {
    minHeight: '100vh',
    fontFamily: fontFamily?.base || 'Inter, system-ui, -apple-system',
    backgroundColor: colors.accent1,
    backgroundImage: `url(${extendAgentBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    paddingBottom: spacing.xl
  };

  const container = {
    maxWidth: 1400,
    margin: '0 auto',
    padding: spacing.lg
  };

  const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  };

  const headerLeft = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md
  };

  const thumb = {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    objectFit: 'cover',
    boxShadow: '0 6px 18px rgba(8,15,20,0.06)'
  };

  const titleBlock = { display: 'flex', flexDirection: 'column' };
  const subtitle = { color: '#5b5b5b', fontSize: fontSize.sm, marginTop: 4 };
  const slotBox = { textAlign: 'right' };
  const slotBig = { fontSize: fontSize.xl, fontWeight: 800, color: colors.accent5 };

  const card = {
    backgroundColor: colors.accent5,
    color: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: '0 8px 30px rgba(8,15,20,0.08)'
  };

  const sectionsStack = { display: 'flex', flexDirection: 'column', gap: spacing.lg, marginBottom: spacing.lg };
  const smallCard = { background: 'transparent', padding: spacing.sm, borderRadius: radius.md };
  const tableWrap = { marginTop: spacing.md, overflowX: 'auto' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: fontSize.sm, tableLayout: 'fixed' };
  const passengerCard = { backgroundColor: colors.bg, color: colors.text, borderRadius: radius.md, padding: spacing.lg, boxShadow: '0 6px 18px rgba(8,15,20,0.06)' };
  const passengerTableStyle = { ...tableStyle, color: colors.text, wordBreak: 'break-word' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '380px 1fr', gap: spacing.lg, marginTop: spacing.lg };
  // Ensure passenger card stretches to match left column height and table scrolls
  passengerCard.display = 'flex';
  passengerCard.flexDirection = 'column';
  passengerCard.flex = 1;
  tableWrap.flex = 1;
  tableWrap.overflowY = 'auto';

  return (
    <div style={page}>
      <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: colors.bg }} />
      <main style={container}>
        <TripTabs />

        <div style={header}>
          <div style={headerLeft}>
            <img src="/src/assets/images/tripexplorebg.png" alt="trip" style={thumb} />
            <div style={titleBlock}>
              <h2 style={{ margin: 0, color: '#2b2b2b' }}>Labuan Bajo</h2>
              <div style={subtitle}>2D1N · Island Exploration</div>
              <div style={{ color: '#7a6a45', marginTop: 6, fontSize: fontSize.sm }}>1–2 February 2026 · East Nusa Tenggara, Indonesia</div>
            </div>
          </div>
          <div style={slotBox}>
            <div style={{ color: '#7a6a45', fontWeight: 600 }}>Available Slot</div>
            <div style={slotBig}>8/15</div>
          </div>
        </div>
        
        <Modal open={modalOpen} onClose={closePassengerModal} title={''}>
          {selectedPassenger && (
            <>
              <div style={{ backgroundColor: '#ffffff', borderRadius: radius.md, padding: spacing.md, boxShadow: '0 6px 18px rgba(8,15,20,0.06)', color: colors.accent5 }}>
                  <div style={{ fontSize: fontSize.xl, fontWeight: 700, marginBottom: spacing.sm, color: colors.accent5 }}>Booking Details</div>
                  <div style={{ marginBottom: spacing.md }}>
                    <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Username</div>
                    <div style={{ fontWeight: 700, marginBottom: spacing.xs }}>@{selectedPassenger.username}</div>
                  </div>
                
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'nowrap', overflowX: 'auto' }}>
                    <div style={{ flex: '2 1 0', minWidth: 0 }}>
                      <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Name</div>
                      <div style={{ fontWeight: 600 }}>{selectedPassenger.fullname}</div>
                    </div>
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Phone Number</div>
                      <div style={{ fontWeight: 600 }}>{selectedPassenger.phone}</div>
                    </div>
                    <div style={{ flex: '0.6 1 0', minWidth: 0 }}>
                      <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Gender</div>
                      <div style={{ fontWeight: 600 }}>{selectedPassenger.gender}</div>
                    </div>
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Date of Birth</div>
                      <div style={{ fontWeight: 600 }}>{selectedPassenger.dob}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ fontSize: fontSize.sm, opacity: 0.9, marginBottom: spacing.xs }}>Notes</div>
                  <div style={{ borderRadius: radius.sm, color: colors.accent5, fontWeight: 600 }}>
                    I prefer a window seat during transportation if available, prefer a lower bunk for sleeping arrangements, and have food allergies to peanuts and shrimp.
                  </div>
                </div>

                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ fontSize: fontSize.sm, opacity: 0.9 }}>Pick Up Point</div>
                  <div style={{ fontWeight: 600 }}>{selectedPassenger.pickup}</div>
                </div>
              </div>
              
              <div style={{padding: spacing.md, paddingLeft: spacing.sm, marginTop: spacing.sm, display: 'flex', justifyContent: 'flex-start', gap: spacing.sm }}>
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <Button variant="btn1" style={{ display: 'inline-flex', gap: spacing.xs }}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </Button>
                  <Button variant="btn2" style={{ display: 'inline-flex', gap: spacing.xs }}>
                    <FontAwesomeIcon icon={faCheck} /> Confirm
                  </Button>
                  <Button variant="btn3" onClick={closePassengerModal} style={{ display: 'inline-flex', gap: spacing.xs }}>
                    <FontAwesomeIcon icon={faXmark} /> Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal>
        {/* Side-by-side layout: left summary (fixed width) and right passenger list (fills remaining width) */}
        <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing.lg, alignItems: 'stretch' }}>
          <div style={{ width: 380, flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                <div style={smallCard}>
                  <h3 style={{ marginTop: 0, marginBottom: spacing.sm }}>Participant Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    <div>Total Participant : 15</div>
                    <div>Confirmed : 8</div>
                    <div>Available Slots : 7</div>
                  </div>
                </div>

                <div style={smallCard}>
                  <h3 style={{ marginTop: 0, marginBottom: spacing.sm }}>Pick Up Point Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                    <div>Orivia Agent Gambir, Jakarta : 6</div>
                    <div>Orivia Agent Pasteur, Bandung : 1</div>
                    <div>Soekarno Hatta Airport, Jakarta : 1</div>
                  </div>
                </div>

                <div style={smallCard}>
                  <h3 style={{ marginTop: 0, marginBottom: spacing.sm }}>Financial Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                    <div>Total Trip Revenue : IDR 63,000,000</div>
                    <div>Total Pickup Revenue : IDR 8,500,000</div>
                    <div>Total Revenue : IDR 71,500,000</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: spacing.xs }}>
              <Button
                variant="primary"
                onClick={() => downloadCSV(passengerSample)}
                style={{ padding: `${spacing.sm} ${spacing.md}`, width: '100%' }}
              >
                <FontAwesomeIcon icon={faDownload} style={{ marginRight: spacing.xs }} />
                Download
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={passengerCard}>
              <h3 style={{ marginTop: 0, marginBottom: spacing.sm, color: colors.accent5 }}>Passenger List</h3>
              <div style={{ ...tableWrap, minHeight: '420px', maxHeight: passengerSample.length > 10 ? '420px' : undefined }}>
                <table style={passengerTableStyle}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ textAlign: 'center', borderBottom: `1px solid ${colors.accent5}22`, backgroundColor: colors.accent5 }}>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '11%', textAlign: 'center' }}>Username</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '27%', textAlign: 'center' }}>Full Name</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '8%', textAlign: 'center' }}>Gender</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '7%', textAlign: 'center' }}>Age</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '28%', textAlign: 'center'}}>Pick Up Point</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '14%' }}>Phone Number</th>
                      <th style={{ padding: spacing.sm, color: colors.bg, width: '8%', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengerSample.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${colors.accent5}11` }}>
                        <td style={{ padding: spacing.sm }}>{p.username}</td>
                        <td style={{ padding: spacing.sm }}>{p.fullname}</td>
                        <td style={{ padding: spacing.sm }}>{p.gender}</td>
                        <td style={{ padding: spacing.sm }}>{calculateAge(p.dob)} yrs</td>
                        <td style={{ padding: spacing.sm }}>{p.pickup}</td>
                        <td style={{ padding: spacing.sm }}>{p.phone}</td>
                        <td style={{ padding: spacing.sm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button onClick={() => openPassengerModal(p)} style={{ background: 'transparent', border: 'none', color: colors.accent5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="View">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
