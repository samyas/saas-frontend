'use client';

import * as React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserMenu } from './UserMenu';
import { ThemeCustomizer, ThemeCustomizerTrigger } from '@/components/theme/ThemeCustomizer';

export function Header() {
  const { user } = useAuth();
  const [customizerOpen, setCustomizerOpen] = React.useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.firstName}!
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <ThemeCustomizerTrigger onClick={() => setCustomizerOpen(true)} />
          <UserMenu />
        </div>
      </header>

      <ThemeCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
    </>
  );
}
