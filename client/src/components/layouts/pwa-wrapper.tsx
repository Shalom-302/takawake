"use client";

import React from 'react';
import { PWAPrompt } from '@/components/pwa/pwa-prompt';
import { usePWA } from '@/lib/contexts/pwa-context';

interface PWAWrapperProps {
  children: React.ReactNode;
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const { isOnline } = usePWA();

  return (
    <>
      {children}
      <PWAPrompt />
      
      {/* Offline status banner for pages that are not the offline page */}
      {!isOnline && window.location.pathname !== '/offline' && (
        <div className="fixed top-0 left-0 w-full bg-amber-600 text-white text-sm py-1 px-4 text-center z-50">
          You are currently offline. Some features may not be available.
        </div>
      )}
    </>
  );
}
