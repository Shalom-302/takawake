"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MessageSquare, Bell, BarChart3, Clock, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeStamp, setTimeStamp] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'refreshing'>('valid');
  const [stats, setStats] = useState({
    messagesCount: 3,
    activitiesCount: 2,
    notificationsCount: 2,
    lastConnection: "today at 15:30",
    currentSessionDuration: 0
  });

  // Function to update session duration
  const updateSessionDuration = useCallback(() => {
    setStats(prev => ({
      ...prev,
      currentSessionDuration: prev.currentSessionDuration + 1
    }));
  }, []);

  useEffect(() => {
    // Listen to console logs to capture refresh events
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      if (args[0] === 'Token refresh in progress...' || args[0]?.includes?.('token')) {
        setTokenStatus('refreshing');
        setLastRefresh(new Date().toLocaleTimeString());
        
        // Reset status to “valid” after 2 seconds
        setTimeout(() => {
          setTokenStatus('valid');
        }, 2000);
      }
      originalConsoleLog.apply(console, args);
    };

    // Update timestamp every second to show that the component is active
    const timeInterval = setInterval(() => {
      setTimeStamp(new Date().toLocaleTimeString());
    }, 1000);
    
    // Update session duration every minute
    const sessionInterval = setInterval(updateSessionDuration, 60000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(sessionInterval);
      console.log = originalConsoleLog;
    };
  }, [updateSessionDuration]);

  // Format session duration in hours:minutes
  const formatSessionDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome {user?.username || 'to your dashboard'}. Here is a summary of your activity.
          </p>
        </div>

        {/* Token refresh notification */}
        {tokenStatus === 'refreshing' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Token refresh in progress...</p>
            <p>Last attempt : {lastRefresh}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Unread messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesCount}</div>
              <p className="text-xs text-muted-foreground">
                +2 since yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notificationsCount}</div>
              <p className="text-xs text-muted-foreground">
                Need your attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Last connection</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold">{stats.lastConnection}</div>
              <p className="text-xs text-muted-foreground">
                Session active: {formatSessionDuration(stats.currentSessionDuration)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Token status</CardTitle>
              <RefreshCw className={`h-4 w-4 ${tokenStatus === 'refreshing' ? 'animate-spin text-amber-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold capitalize">{tokenStatus === 'valid' ? 'Valid' : 'Refreshing'}</div>
              <p className="text-xs text-muted-foreground">
                Last refresh: {lastRefresh || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Recent messages</CardTitle>
              <CardDescription>Your recent conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Conversation with Marie</p>
                    <p className="text-sm text-muted-foreground">Hello, how are you today?</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Conversation with Thomas</p>
                    <p className="text-sm text-muted-foreground">Have you received the documents I sent you?</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Conversation with Sophie</p>
                    <p className="text-sm text-muted-foreground">N&apos;oubliez pas notre rendez-vous de demain à 14h.</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/messages">See all messages</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Detailed Stats */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">System activity</CardTitle>
              <CardDescription>Information about the system state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>System performance</span>
                  </div>
                  <span className="font-medium">Excellent</span>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground">The system is operating at 92% of its optimal capacity.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>WebSocket connection status</span>
                  </div>
                  <span className="font-medium text-green-500">Connected</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Message deduplication system is active and functional.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Recent system log</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>● WebSocket service connected at {timeStamp}</p>
                  <p>● Last WebSocket deduplication message: successful</p>
                  <p>● User session active since: {formatSessionDuration(stats.currentSessionDuration)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/system-status">Check system status</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
