/**
 * Admin Analytics Dashboard Page
 * 
 * This page displays comprehensive analytics data for administrators,
 * including user behavior, heatmaps, and engagement metrics.
 */
import React from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/layouts/admin-layout';
import AnalyticsOverview from '@/components/analytics/analytics-overview';
import HeatmapViewer from '@/components/analytics/heatmap-viewer';
import UserJourneyViewer from '@/components/analytics/user-journey-viewer';

export const metadata: Metadata = {
  title: 'Analyses utilisateur | Tableau de bord administrateur',
  description: 'Analyse du comportement des utilisateurs et des interactions',
};

export default function AnalyticsDashboardPage() {
  return (
    <AdminLayout
      title="Analyses utilisateur"
      description="Suivi et analyse du comportement des utilisateurs"
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
          <TabsTrigger value="user-journeys">Parcours utilisateur</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <AnalyticsOverview className="mb-8" />
        </TabsContent>

        <TabsContent value="heatmaps" className="mt-6">
          <div className="grid grid-cols-1 gap-8">
            <HeatmapViewer />
          </div>
        </TabsContent>

        <TabsContent value="user-journeys" className="mt-6">
          <div className="grid grid-cols-1 gap-8">
            <UserJourneyViewer />
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
