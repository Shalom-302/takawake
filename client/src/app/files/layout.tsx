"use client"

import React from 'react';
import { LayoutWithSidebar } from '@/components/layout/layout-with-sidebar';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <LayoutWithSidebar>
        {children}
      </LayoutWithSidebar>
  );
}
