"use client";

import React, { ReactNode } from 'react';
import { LayoutWithSidebar } from '@/components/layout/layout-with-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  );
}
