import { useContext, useState, useEffect } from 'react';
import { loadingContext } from '../reactContext/loading';
import { Link } from 'react-router-dom';

export function ButtonLink({ link, title, nameClass, icon, onClick }) {
  return (
    <Link
      className={`anchor ${nameClass ? nameClass : ''}`}
      to={link}
      preventScrollReset={true}
      onClick={onClick}
      // Added a base inline transition to smooth out any CSS class hover effects
      style={{ transition: 'all 0.2s ease' }}
    >
      {title}
    </Link>
  );
}

export function Button({
  style = useContext(loadingContext),
  msg,
  isDisabled,
  nameClass,
  onClick,
  type = 'submit',
}) {
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (style === 'loading' || style === 'submitting' || isDisabled) {
      setBtnDisabled(true);
    } else {
      setBtnDisabled(false);
    }
  }, [style, isDisabled]);

  return (
    <button
      className={`btn ${nameClass ? `btn__${nameClass}` : ''}`}
      disabled={btnDisabled}
      type={type}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Tech Freak Aesthetic styling
        backgroundColor: btnDisabled ? '#94a3b8' : '#0ea5e9', // Slate for disabled, Sky Blue for active
        color: '#ffffff',
        cursor: btnDisabled ? 'not-allowed' : 'pointer',
        padding: '0.8rem 2.5rem',
        borderRadius: '50px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '1.05rem',
        transition: 'all 0.2s ease',
        boxShadow: btnDisabled 
          ? 'none' 
          : '0 4px 14px 0 rgba(14, 165, 233, 0.3)',
        opacity: btnDisabled ? 0.7 : 1,
        // Lift effect on hover (only if not disabled!)
        transform: (isHovered && !btnDisabled) ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {msg}
    </button>
  );
}