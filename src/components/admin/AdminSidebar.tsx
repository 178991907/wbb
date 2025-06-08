
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  List,
  Link2,
  Settings,
  Lock,
  LogOut,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: List },
  { href: '/admin/links', label: 'Links', icon: Link2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/change-password', label: 'Change Password', icon: Lock },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r bg-card text-card-foreground shadow-md">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          <h2 className="text-xl font-bold text-primary">Link Hub Admin</h2>
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
