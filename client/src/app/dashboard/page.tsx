"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [timeStamp, setTimeStamp] = useState<string>('');

  useEffect(() => {
    // Update timestamp every second to show that the component is active
    const interval = setInterval(() => {
      setTimeStamp(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
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
