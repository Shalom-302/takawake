"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [timeStamp, setTimeStamp] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'refreshing'>('valid');

  useEffect(() => {
    // Écouter les logs de console pour capturer les événements de rafraîchissement
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      if (args[0] === 'Rafraîchissement du token...') {
        setTokenStatus('refreshing');
        setLastRefresh(new Date().toLocaleTimeString());
        
        // Remettre le statut à "valid" après 2 secondes
        setTimeout(() => {
          setTokenStatus('valid');
        }, 2000);
      }
      originalConsoleLog.apply(console, args);
    };

    // Mettre à jour le timestamp toutes les secondes pour montrer que le composant est actif
    const interval = setInterval(() => {
      setTimeStamp(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => {
      clearInterval(interval);
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {tokenStatus === 'refreshing' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Refreshing the current token...</p>
            <p>Last attempt: {lastRefresh}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.username || user?.email || 'User'}</CardTitle>
              <CardDescription>You are logged in successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your ID: {user?.id}</p>
              <p>Last updated: {timeStamp}</p>
              {user?.role && (
                <p>Role: {user.role.name}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <span className="text-green-500 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Token expiration:</span>
                  <span className="text-yellow-500 font-medium">30 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Refresh:</span>
                  <span className="text-green-500 font-medium">Automatic</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Available features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Profile</Button>
              <Button className="w-full" variant="outline">Settings</Button>
              <Button className="w-full" variant="secondary">Help</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
