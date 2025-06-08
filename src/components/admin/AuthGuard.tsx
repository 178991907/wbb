
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // MOCK AUTHENTICATION CHECK
    const adminAuthStatus = localStorage.getItem('isAdminAuthenticated');
    const authenticated = adminAuthStatus === 'true';
    setIsAuthenticated(authenticated);

    if (!authenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (authenticated && pathname === '/admin/login') {
      router.push('/admin/dashboard');
    }
  }, [router, pathname]);

  if (isAuthenticated === null) {
    // Optional: Show a loading spinner or a blank page while checking auth
    return <div className="flex min-h-screen items-center justify-center bg-background"><p>Loading...</p></div>;
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    // This case should ideally be handled by the redirect, but as a fallback:
    return null; 
  }
  
  if (isAuthenticated && pathname === '/admin/login') {
    // This case should ideally be handled by the redirect, but as a fallback:
    return null;
  }

  return <>{children}</>;
}
