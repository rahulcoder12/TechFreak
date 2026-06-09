import { FaGithub, FaLinkedin, FaPhoneAlt, FaFilePdf } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Helper function for buttery smooth hover animations
  const handleHover = (e, isHovered) => {
    e.currentTarget.style.color = isHovered ? '#0ea5e9' : '#94a3b8'; // Changes to Electric Cyan on hover
    e.currentTarget.style.transform = isHovered ? 'translateY(-3px)' : 'translateY(0)';
  };

  return (
    <footer style={{
      backgroundColor: '#0f172a', // Deep slate background to anchor the page
      color: '#f8fafc',
      padding: '4rem 2rem 2rem 2rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Main Signature */}
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#cbd5e1' }}>
          Made by <span style={{ 
            background: 'linear-gradient(135deg, #a5b4fc 0%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            letterSpacing: '-0.02em'
          }}>Rahul Bhuiya</span>
        </p>

        {/* Social & Contact Icons */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '0.5rem' }}>
          
          {/* LinkedIn Profile */}
          <a 
            href="https://www.linkedin.com/in/rahul-bhuiya/" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: '#94a3b8', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
            title="LinkedIn"
          >
            <FaLinkedin size={26} />
          </a>

          {/* GitHub Profile */}
          <a 
            href="https://github.com/rahulcoder12" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: '#94a3b8', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
            title="GitHub"
          >
            <FaGithub size={26} />
          </a>

          {/* Resume Link */}
          {/* Note: Place your resume PDF in the 'public' folder of your React app */}
          <a 
            href="/Resume_Rahul_Bhuiya.pdf" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: '#94a3b8', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
            title="View Resume"
          >
            <FaFilePdf size={24} />
          </a>

          {/* Phone Number */}
          <a 
            href="tel:+919883498553" 
            style={{ color: '#94a3b8', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
            title="Call Me"
          >
            <FaPhoneAlt size={22} />
          </a>

        </div>

        {/* Copyright Line */}
        <div style={{ 
          marginTop: '2rem', 
          width: '100%', 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          paddingTop: '2rem', 
          textAlign: 'center' 
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
            &copy; {currentYear} Tech-Freak. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}