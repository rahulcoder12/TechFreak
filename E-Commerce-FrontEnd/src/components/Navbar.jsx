import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/swrhook';
import { Logout } from '../utilities/utility';
import { useSWRConfig } from 'swr';
// Notice we removed the old SearchField import and added BsSearch!
import { BsCart, BsList, BsSearch } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { navbarData } from '../utilities/navbardata';
import Skeleton from 'react-loading-skeleton';
import { renderToastify, updateToastify } from '../utilities/toastify';

export default function Navbar() {
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();
  const [navActive, setNavActive] = useState(false);
  const { user, userLoading } = useUser();

  async function handleLogOut(e) {
    const id = renderToastify('Logging you out...');
    try {
      e.preventDefault();
      await mutate(`${import.meta.env.VITE_BACKEND_URL}/users/isLoggedIn`, Logout());
      updateToastify(id, "You've been logged out of your account", 'success');
      navigate('/'); 
    } catch (err) {
      updateToastify(id, 'Something went wrong while trying to log you out', 'error');
    }
  }

  // THE NEW BULLETPROOF SEARCH FUNCTION
  function handleSearchSubmit(e) {
    e.preventDefault(); // Stops the page from hard-refreshing
    const formData = new FormData(e.target);
    const query = formData.get('q');
    
    // Stop empty searches dead in their tracks
    if (!query || query.trim() === '') return; 
    
    // Force React Router to navigate directly to the correct URL
    navigate(`/products/search?q=${encodeURIComponent(query.trim())}&page=1`);
  }

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)', 
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '1.2rem 3rem', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <BsList
            size={34} 
            style={{ cursor: 'pointer', color: '#0f172a', transition: 'transform 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setNavActive(true)}
          />
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{ 
              margin: 0, 
              fontSize: '2.2rem', 
              fontWeight: '900', 
              letterSpacing: '-0.06em', 
              background: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 14px rgba(14, 165, 233, 0.15)' 
            }}>
              TECH-FREAK
            </p>
          </Link>
        </div>

        {/* --- NATIVE HTML SEARCH FORM --- */}
        <div style={{ flex: 1, maxWidth: '750px', margin: '0 3rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', alignItems: 'center', position: 'relative' }}>
            <input 
              type="text" 
              name="q" // This is the 'q' parameter!
              placeholder="Search laptops, phones, audio..." 
              style={{ 
                width: '100%', 
                padding: '0.8rem 1.5rem', 
                paddingRight: '4rem', // Make room for the button
                borderRadius: '50px', 
                border: '2px solid #e2e8f0', 
                fontSize: '1.05rem', 
                outline: 'none',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button 
              type="submit" 
              style={{ 
                position: 'absolute', 
                right: '6px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)',
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '50px', 
                padding: '0.6rem 1.2rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <BsSearch size={18} />
            </button>
          </form>
        </div>

        <nav>
          <ul style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {userLoading ? (
              <Skeleton width={200} height={30} borderRadius="0.5rem" />
            ) : (
              <>
                {user?.message ? (
                  <>
                    <li>
                      <Link to={`/user/${user.data.user._id}`} style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '1.1rem' }}>
                        Hi, <span style={{ color: '#0f172a', fontWeight: '800' }}>{user.data.user.Name}</span>
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', fontWeight: '700', fontSize: '1.05rem', padding: 0 }}>
                        Logout
                      </button>
                    </li>
                    <li>
                      <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#0f172a', transition: 'transform 0.2s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <BsCart size={28} />
                        <span style={{
                          position: 'absolute', top: '-8px', right: '-12px', backgroundColor: '#06b6d4', color: '#ffffff', borderRadius: '50%', minWidth: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', padding: '2px', boxShadow: '0 4px 6px -1px rgba(6, 182, 212, 0.4)'
                        }}>
                          {user.data.user.products.length}
                        </span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '1.1rem' }}>Login</Link>
                    </li>
                    <li>
                      <Link to="/signup" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', color: '#ffffff', padding: '0.8rem 1.6rem', borderRadius: '50px', fontWeight: '700', fontSize: '1.05rem', boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.3)' }}>
                        Signup
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Sidebar and Overlay remain unchanged */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '360px', backgroundColor: '#ffffff', boxShadow: navActive ? '25px 0 35px -5px rgba(0,0,0,0.15)' : 'none', zIndex: 100, transform: navActive ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>Explore Tech</h2>
          <AiOutlineClose size={28} style={{ cursor: 'pointer', color: '#64748b', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'} onMouseOut={(e) => e.currentTarget.style.color = '#64748b'} onClick={() => setNavActive(false)} />
        </div>
        <ul style={{ listStyle: 'none', padding: '1.5rem', margin: 0, overflowY: 'auto' }}>
          {navbarData.map((el) => (
            <li key={el.title} style={{ marginBottom: '0.8rem' }}>
              <Link to={el.link} onClick={() => setNavActive(false)} style={{ display: 'block', padding: '1.2rem 1.5rem', textDecoration: 'none', color: '#334155', fontWeight: '700', fontSize: '1.2rem', borderRadius: '0.75rem', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.transform = 'translateX(5px)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                {el.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div onClick={() => setNavActive(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 90, opacity: navActive ? 1 : 0, pointerEvents: navActive ? 'auto' : 'none', transition: 'opacity 0.4s ease', backdropFilter: 'blur(4px)' }} />
    </>
  );
}