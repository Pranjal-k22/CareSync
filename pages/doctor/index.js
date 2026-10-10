import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '@/lib/context';
import IndexAuthCheck from '@/components/Auth/IndexAuthCheck';
import DoctorDashboard from './dashboard';

export default function DoctorPortalRoot() {
  const { user, userRole } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (user && userRole === 'doctor') {
      router.replace('/doctor/dashboard');
    }
  }, [user, userRole, router]);

  if (!user) {
    return <IndexAuthCheck />;
  }

  if (userRole !== 'doctor') {
    return <IndexAuthCheck />;
  }

  return <DoctorDashboard />;
}