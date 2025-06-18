/**
 * Service for interacting with the Advanced Audit API
 */

import axiosClient from '@/lib/api/axios-client';
import { AxiosResponse } from 'axios';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  resource: string;
  details: string | null;
  created_at: string;
}

export interface CreateAuditLogRequest {
  user_id?: number;
  action: string;
  resource: string;
  details?: string;
}

export interface AuditMetrics {
  events_by_resource: Record<string, number>;
  events_by_action: Record<string, number>;
  total_events: number;
  last_event_timestamp: number | null;
}

const auditService = {
  /**
   * Récupère tous les logs d'audit
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response: AxiosResponse<AuditLog[]> = await axiosClient.get('/advanced_audit/logs');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs d\'audit:', error);
      throw error;
    }
  },

  /**
   * Récupère les logs d'audit filtrés par ressource
   */
  async getAuditLogsByResource(resource: string): Promise<AuditLog[]> { 
    try {
      const allLogs = await this.getAuditLogs();
      return allLogs.filter(log => log.resource === resource);
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs d'audit pour la ressource ${resource}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les logs d'audit filtrés par action
   */
  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    try {
      const allLogs = await this.getAuditLogs();
      return allLogs.filter(log => log.action === action);
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs d'audit pour l'action ${action}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau log d'audit
   */
  async createAuditLog(logData: CreateAuditLogRequest): Promise<AuditLog> {
    try {
      const response: AxiosResponse<AuditLog> = await axiosClient.post('/advanced_audit/logs', logData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création d\'un log d\'audit:', error);
      throw error;
    }
  },

  /**
   * Supprime un log d'audit
   */
  async deleteAuditLog(logId: number): Promise<void> {
    try {
      await axiosClient.delete(`/advanced_audit/logs/${logId}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du log d'audit ${logId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les métriques d'audit
   * Note: Cette fonction nécessite une adaptation côté backend pour renvoyer les métriques au format JSON
   */
  async getAuditMetrics(): Promise<AuditMetrics> {
    try {
      // Récupérer tous les logs pour calculer les métriques côté client
      const logs = await this.getAuditLogs();
      
      // Calculer les métriques
      const metrics: AuditMetrics = {
        events_by_resource: {},
        events_by_action: {},
        total_events: logs.length,
        last_event_timestamp: logs.length > 0 
          ? new Date(logs[0].created_at).getTime() / 1000 
          : null
      };
      
      // Compter les événements par ressource
      logs.forEach(log => {
        metrics.events_by_resource[log.resource] = 
          (metrics.events_by_resource[log.resource] || 0) + 1;
          
        metrics.events_by_action[log.action] = 
          (metrics.events_by_action[log.action] || 0) + 1;
      });
      
      return metrics;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques d\'audit:', error);
      throw error;
    }
  }
};

export default auditService;
