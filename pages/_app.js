// pages/_app.js
import '../styles/app.scss';
import { useState, useEffect } from 'react';
import { UserContext } from '@/lib/context';
import Navbar from '@/components/navbar';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial session from Supabase / localStorage if configured
    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          const metaRole = currentSession.user?.user_metadata?.role || 'patient';
          const metaName = currentSession.user?.user_metadata?.name || currentSession.user?.email?.split('@')[0] || 'User';
          setUserRole(metaRole);
          setCurrentUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            name: metaName,
            role: metaRole
          });
        }
      } catch (err) {
        console.warn('Supabase auth session check:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Listen for Auth State Changes if configured
    let subscription = null;
    if (isSupabaseConfigured) {
      const res = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setUser(newSession.user);
          const metaRole = newSession.user?.user_metadata?.role || 'patient';
          const metaName = newSession.user?.user_metadata?.name || newSession.user?.email?.split('@')[0] || 'User';
          setUserRole(metaRole);
          setCurrentUser({
            id: newSession.user.id,
            email: newSession.user.email,
            name: metaName,
            role: metaRole
          });
        } else {
          setUser(null);
          setSession(null);
          setCurrentUser(null);
          setUserRole('patient');
        }
      });
      subscription = res.data?.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout error:', e);
      }
    }
    setUser(null);
    setSession(null);
    setCurrentUser(null);
    setUserRole('patient');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      session,
      setSession,
      userRole, 
      setUserRole, 
      currentUser, 
      setCurrentUser,
      isLoading,
      signOut: handleSignOut
    }}>
      <Navbar />     
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}