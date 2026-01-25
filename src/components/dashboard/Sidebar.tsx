'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Building2, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Organization', href: '/organization', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Combine navigation items, including admin panel if user is super admin
  const allNavigation = user?.role === 'SUPER_ADMIN' 
    ? [...navigation, ...adminNavigation] 
    : navigation;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card shadow-lg animate-slide-in">
      <div className="flex h-16 items-center border-b px-6 bg-muted">
        <h1 className="text-xl font-bold text-primary">SaaS App</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {allNavigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 animate-fade-in hover-lift',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground hover:bg-muted hover:shadow-md'
              )}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
