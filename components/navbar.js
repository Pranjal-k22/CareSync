import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { UserContext } from '@lib/context';

export default function Navbar() {
  const router = useRouter();
  const { user, userRole, signOut } = useContext(UserContext);

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.85rem 1.5rem', 
      background: 'rgba(6, 11, 25, 0.95)', 
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginRight: '2rem', textDecoration: 'none' }}>
        <img src="/Logo.svg" alt="HealConnect Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
          Heal<span style={{ color: '#34d399' }}>Connect</span>
        </span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
        <Link href="/" style={{ color: isActive('/') ? '#34d399' : '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s', padding: '0.35rem 0.65rem', borderRadius: '8px', background: isActive('/') ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>Home</Link>
        
        {user && (
          <Link 
            href="/ai-dashboard" 
            style={{ 
              color: isActive('/ai-dashboard') ? '#10b981' : '#34d399', 
              textDecoration: 'none', 
              transition: 'all 0.2s ease', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: isActive('/ai-dashboard') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(52, 211, 153, 0.12)', 
              padding: '0.35rem 0.85rem', 
              borderRadius: '9999px', 
              border: '1px solid rgba(52, 211, 153, 0.3)',
              fontWeight: '700',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(52, 211, 153, 0.15)'
            }}
          >
            <span style={{ fontSize: '1rem' }}>🤖</span>
            <span>AI Engine</span>
          </Link>
        )}

        <Link href="/monitoring" style={{ color: isActive('/monitoring') ? '#34d399' : '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s', padding: '0.35rem 0.65rem', borderRadius: '8px', background: isActive('/monitoring') ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>Monitoring</Link>
        <Link href="/prescriptions" style={{ color: isActive('/prescriptions') ? '#34d399' : '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s', padding: '0.35rem 0.65rem', borderRadius: '8px', background: isActive('/prescriptions') ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>Prescriptions</Link>
        <Link href="/appointments" style={{ color: isActive('/appointments') ? '#34d399' : '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s', padding: '0.35rem 0.65rem', borderRadius: '8px', background: isActive('/appointments') ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>Appointments</Link>
        <Link href="/contact" style={{ color: isActive('/contact') ? '#34d399' : '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s', padding: '0.35rem 0.65rem', borderRadius: '8px', background: isActive('/contact') ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>Contact</Link>
      </div>

      {!user ? (
        <Link 
          href="/login" 
          style={{ 
            marginLeft: 'auto', 
            background: 'linear-gradient(to right, #2563eb, #14b8a6)', 
            color: 'white', 
            padding: '0.45rem 1.15rem', 
            borderRadius: '9999px', 
            fontWeight: '700', 
            fontSize: '0.85rem', 
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' 
          }}
        >
          Login ➔
        </Link>
      ) : (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href={userRole === 'admin' ? '/admin/dashboard' : userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>👤</span>
            <span>{userRole ? userRole.toUpperCase() : 'PROFILE'}</span>
          </Link>
          <button
            onClick={() => {
              if (signOut) signOut();
              router.push('/login');
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
