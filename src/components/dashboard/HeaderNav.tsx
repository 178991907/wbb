
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, LogOut, UserCog } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to avoid hydration mismatch
    // Render a button shell to keep layout consistent
    return <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled className="h-9 w-9" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
      className="h-9 w-9" // Consistent sizing
    >
      {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function UserNavButton() {
  const handleLogout = () => {
    // In a real app, this would clear auth state (e.g., localStorage, cookies)
    // and potentially redirect. For admin, logout is handled in AdminSidebar.
    // For a public user, this might be different.
    alert('Logout clicked - implement actual user logout if needed for public page.');
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout"  className="h-9 w-9">
      <LogOut className="h-5 w-5" />
    </Button>
  );
}

export function AdminEntryButton() {
  return (
    <Button variant="ghost" size="icon" asChild aria-label="Admin Panel"  className="h-9 w-9">
      <Link href="/admin/login">
        <UserCog className="h-5 w-5" />
      </Link>
    </Button>
  );
}


export function HeaderNav() {
  return (
    <header className="absolute top-4 right-4 flex items-center space-x-1 z-10"> {/* Reduced space-x-2 to space-x-1 for tighter packing */}
      <ThemeToggle />
      <AdminEntryButton />
      {/* <UserNavButton />  Consider if a separate user logout is needed here or if admin logout is sufficient */}
    </header>
  );
}
