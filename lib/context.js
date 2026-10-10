// lib/context.js
import { createContext } from 'react';

export const UserContext = createContext({
  user: null,
  session: null,
  setUser: () => {},
  userRole: 'patient',
  setUserRole: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: false,
  signOut: async () => {},
});
