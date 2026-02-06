import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import { FeatureCard } from '../../components/ui/Card.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCompass, faRoute, faLightbulb, faMagnifyingGlass, faTicket, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { colors } from '../../styles/variables.jsx';
import topImage from '../../assets/images/landingpage1.png';
import bottomImage from '../../assets/images/landingpage2.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const navbarVariant = userRole === 'TRAVEL_AGENT' ? 'agent' : 'customer';

  return (
    <div style={{ position: 'relative', minHeight: '2800px', backgroundColor: '#0D2E3F' }}>
      <img src={topImage} alt="landing top" style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 'auto', zIndex: 0, display: 'block', pointerEvents: 'none' }} />
      <img src={bottomImage} alt="landing bottom" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 'auto', zIndex: 0, display: 'block', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translateX(-50%) scale(1.15)', width: '2200px', height: '450px', background: '#0D2E3F', filter: 'blur(50px)', willChange: 'transform, filter', zIndex: 5, pointerEvents: 'none' }} />
      <Navbar variant={navbarVariant} style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />

      <main style={{ padding: 32, height: '1832px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'flex-start' }}>
        {/* Hero Text Section */}
        <section style={{ position: 'absolute', left: 0, right: 0, top: 500, padding: '0 32px', zIndex: 10 }}>
          <div style={{ marginLeft: 98, display: 'flex', width: 564, flexDirection: 'column', alignItems: 'flex-start', gap: 25 }}>
            <div style={{ display: 'flex', height: 135, flexDirection: 'column', justifyContent: 'center', alignSelf: 'stretch', color: colors.accent1, fontFamily: 'Poppins, sans-serif', fontSize: 64, fontStyle: 'normal', fontWeight: 700, lineHeight: '70px' }}>From Origin to The Chosen Way</div>
            <div style={{ alignSelf: 'stretch', color: colors.bg, fontFamily: 'Lora, serif', fontSize: 20, fontStyle: 'normal', fontWeight: 700, lineHeight: 'normal' }}>Orivia is a travel platform that helps users move from their starting point to their chosen path.</div>
            <div style={{ display: 'flex', padding: 0, justifyContent: 'flex-start', alignItems: 'center', gap: 5 }}>
              <Button variant="btn2" onClick={() => navigate(userRole === 'TRAVEL_AGENT' ? '/trip/agent' : '/explore/customer')} style={{ minWidth: 180, fontWeight: 600 }}>
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: 6 }} />
                {userRole === 'TRAVEL_AGENT' ? 'Manage Now' : 'Explore Now'}
              </Button>
            </div>
          </div>
        </section>

        {/* New hero section - 489px below previous container */}
        <section style={{ position: 'absolute', left: 0, right: 0, top: 1200, padding: '0 32px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ width: 1600, maxWidth: '100%', display: 'flex', gap: 64, alignItems: 'stretch' }}>
            <div style={{ width: '48%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 580 }}>
              <div style={{ position: 'absolute', right: '8%', top: 0, width: '66%', height: 480, borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 40px rgba(2,12,20,0.4)', border: '10px solid rgba(255,255,255,0.08)', zIndex: 2 }}>
                <img src={bottomImage} alt="Travel moment" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', left: '0%', bottom: 0, width: '78%', height: 520, borderRadius: 32, overflow: 'hidden', boxShadow: '0 30px 60px rgba(2,12,20,0.55)', border: '10px solid rgba(255,255,255,0.1)', zIndex: 1 }}>
                <img src={topImage} alt="Adventure travel" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ width: '52%', borderRadius: 28, padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(165deg, #0A3040 0%, #0E5058 100%)', color: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
              <div>
                <h2 style={{ margin: 0, color: colors.accent1, fontFamily: 'Poppins, sans-serif', fontSize: 52, fontWeight: 800, lineHeight: '1.08', letterSpacing: '-0.02em' }}>
                  We Are The Best Way To Plan Or Follow Your Journey
                </h2>
                <p style={{ marginTop: 24, marginBottom: 40, color: colors.bg, fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 400, lineHeight: 1.6, opacity: 0.95 }}>
                  From discovering destinations to booking and joining trips, everything is designed to make your journey simple, seamless, and enjoyable.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {[
                  { icon: faCompass, title: 'Built for Growth and Exploration', description: 'A platform that grows with your travel needs.' },
                  { icon: faRoute, title: 'Seamless From Planning to Experience', description: 'Everything you need, from planning to going, in one place.' },
                  { icon: faLightbulb, title: 'Smart and Intuitive Platform', description: 'Simple tools that make planning faster and easier.' }
                ].map((feature, index) => (
                  <div key={index} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 36, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.18)', flexShrink: 0 }}>
                      <FontAwesomeIcon icon={feature.icon} style={{ fontSize: 32, color: '#0D2E3F' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: colors.accent1, fontWeight: 700, fontSize: 19, fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}>{feature.title}</div>
                      <div style={{ color: colors.bg, fontFamily: 'Lora, serif', fontSize: 17, lineHeight: 1.5, opacity: 0.9 }}>{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ position: 'absolute', left: 0, right: 0, top: 2000, zIndex: 10 }}>
          <div style={{ position: 'relative', width: '100%', minHeight: 480, padding: '48px 130px', display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div>
                <h2 style={{ margin: 0, color: colors.accent1, fontFamily: 'Poppins, sans-serif', fontSize: 48, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>What We Have</h2>
                <p style={{ margin: 0, color: colors.bg, fontFamily: 'Lora, serif', fontSize: 16, fontWeight: 400, lineHeight: 1.6, opacity: 0.95, textAlign: 'justify', backgroundColor: colors.accent5, padding: '15px 20px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', borderLeft: `10px solid ${colors.accent3}` }}>Our platform is designed to simplify your travel experience by providing essential features that help you discover trips, book easily, and manage everything in one place. We understand that planning a journey can be overwhelming, which is why we've created a comprehensive solution that streamlines every aspect of your travel adventure. From exploring diverse destinations across the globe to connecting with experienced local guides, our platform ensures that your trip is not only memorable but also hassle-free. Whether you're looking to join an existing group tour or create a customized itinerary tailored to your preferences, we provide the tools and support you need to make your travel dreams a reality.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
                <FeatureCard icon={faMagnifyingGlass} title="Trip Discovery" description="Explore various destinations and trip types, from island hopping to mountain hiking." />
                <FeatureCard  icon={faTicket} title="Easy Booking System" description="Book open or custom trips easily with transparent pricing and flexible options." /> 
                <FeatureCard  icon={faUserTie} title="Professional Guide" description="Travel with experienced and certified guides to ensure safety, comfort, and deeper local insight." />
              </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
