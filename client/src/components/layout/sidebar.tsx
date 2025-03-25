"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Bell, 
  User, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
  onToggle?: (isExpanded: boolean) => void;
  initialExpanded?: boolean;
}

export function Sidebar({ className, onToggle, initialExpanded = true }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Synchroniser avec initialExpanded si celui-ci change
  useEffect(() => {
    setExpanded(initialExpanded);
  }, [initialExpanded]);

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    // Notifier le composant parent du changement
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell
    },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden fixed left-4 top-4 z-50"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen border-r bg-background transition-all duration-300",
          expanded ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col py-4">
          {/* Header and toggle */}
          <div className={cn(
            "flex items-center justify-between px-4 py-2 mb-6",
            !expanded && "justify-center"
          )}>
            {expanded && (
              <Link href="/" className="text-xl font-bold">
                Kaapi
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="hidden md:flex"
            >
              {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            <TooltipProvider>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Tooltip key={item.href} delayDuration={expanded ? 999999 : 0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          !expanded && "justify-center"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", expanded && "mr-3")} />
                        {expanded && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn(expanded && "hidden")}>
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>

          {/* Footer info */}
          {expanded && (
            <div className="mt-auto px-4 py-2 text-xs text-muted-foreground">
              <p> {new Date().getFullYear()} Kaapi</p>
              <p>Version 1.0.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
