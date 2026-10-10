import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export function useUserData() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');

  useEffect(() => {
    let isSubscribed = true;

    if (!isSupabaseConfigured) {
      return;
    }

    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isSubscribed) {
          setUser(session.user);
          setUserRole(session.user.user_metadata?.role || 'patient');
        }
      } catch (e) {
        console.warn('useUserData error:', e);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isSubscribed) {
        if (session?.user) {
          setUser(session.user);
          setUserRole(session.user.user_metadata?.role || 'patient');
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    });

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, userRole, setUser, setUserRole };
}
