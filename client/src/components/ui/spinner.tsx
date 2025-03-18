"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export function Spinner({ size = 'medium', message, className = '' }: SpinnerProps) {
  // Définir les tailles
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(sizeClasses[size], "rounded-full border-gray-300 border-t-blue-500 animate-spin")}
        role="status"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}
