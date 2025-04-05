/**
 * Service for user analytics tracking and heatmap visualization.
 * This service integrates with the backend analytics API to track user interactions
 * and provide insights about user behavior.
 */

import axiosClient from '@/lib/api/axios-client';
import { v4 as uuidv4 } from 'uuid';

// Types for analytics service
export interface SessionInfo {
  id: string;
  session_token: string;
  created_at: string;
}

export interface DeviceInfo {
  os?: string;
  browser?: string;
  device_type?: string;
  screen_resolution?: string;
}

export interface UserEvent {
  session_token: string;
  event_type: string;
  target_type: string;
  target_id?: string;
  target_path?: string;
  component_name?: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
  x_position?: number;
  y_position?: number;
  screen_width?: number;
  screen_height?: number;
}

export interface HeatmapFilter {
  start_date?: string;
  end_date?: string;
  page_path?: string;
  component_name?: string;
  event_type?: string;
  user_id?: string;
}

export interface UserJourneyFilter {
  user_id?: string;
  session_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface HeatmapData {
  base64_image: string;
  width: number;
  height: number;
  event_count: number;
  generated_at: string;
  data_points?: Array<{
    x: number;
    y: number;
    event_type: string;
    target_type: string;
    timestamp?: string;
  }>;
}

// Main analytics service
const AnalyticsService = {
  // Current session information
  currentSession: null as SessionInfo | null,
  pendingEvents: [] as UserEvent[],
  isCollectingEvents: false,
  batchSize: 10,
  batchInterval: 10000, // 10 seconds
  batchTimer: null as NodeJS.Timeout | null,
  
  /**
   * Initialize the analytics tracking service
   */
  async init(userId?: string): Promise<SessionInfo | null> {
    try {
      // Skip if already initialized or in development mode
      if (this.currentSession || (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS)) {
        return this.currentSession;
      }
      
      // Get device information
      const deviceInfo = this._getDeviceInfo();
      
      // Create a new session
      const response = await axiosClient.post<SessionInfo>('/user-analytics/sessions/session', {
        user_id: userId,
        device_info: deviceInfo,
        referrer: document.referrer
      });
      
      // Store session information
      this.currentSession = response.data;
      
      // Store session token in a cookie for cross-page tracking
      document.cookie = `session_token=${response.data.session_token}; path=/; max-age=86400; SameSite=Lax`;
      
      // Set up event tracking
      this._setupEventTracking();
      
      return this.currentSession;
    } catch (error) {
      console.error('Failed to initialize analytics tracking:', error);
      return null;
    }
  },
  
  /**
   * Record a user interaction event
   */
  recordEvent(event: Omit<UserEvent, 'session_token'>): void {
    // Skip if no active session
    if (!this.currentSession || !this.isCollectingEvents) {
      return;
    }
    
    const fullEvent: UserEvent = {
      ...event,
      session_token: this.currentSession.id
    };
    
    // Add to pending events queue
    this.pendingEvents.push(fullEvent);
    
    // Send immediately if batch size reached
    if (this.pendingEvents.length >= this.batchSize) {
      this._sendEventBatch();
    }
  },
  
  /**
   * Stop tracking and end the current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) return;
    
    // Send any remaining events
    if (this.pendingEvents.length > 0) {
      await this._sendEventBatch();
    }
    
    // End the session on the server
    try {
      await axiosClient.post(`/user-analytics/sessions/session/${this.currentSession.id}/end`, {}, {
        headers: {
          'X-Session-Token': this.currentSession.session_token
        }
      });
      
      // Clear session data
      this.currentSession = null;
      this.isCollectingEvents = false;
      
      // Clear batch timer
      if (this.batchTimer) {
        clearInterval(this.batchTimer);
        this.batchTimer = null;
      }
      
      // Remove session cookie
      document.cookie = 'session_token=; path=/; max-age=0';
    } catch (error) {
      console.error('Error ending analytics session:', error);
    }
  },
  
  /**
   * Generate a heatmap for a specific page or component
   * (Admin only feature)
   */
  async generateHeatmap(filter: HeatmapFilter): Promise<HeatmapData> {
    try {
      const response = await axiosClient.post<HeatmapData>('/user-analytics/analytics/heatmap', filter);
      return response.data;
    } catch (error) {
      console.error('Error generating heatmap:', error);
      throw error;
    }
  },
  
  /**
   * Get user journey data for analysis
   * (Admin only feature)
   */
  async getUserJourney(filter: UserJourneyFilter): Promise<any> {
    try {
      const response = await axiosClient.post('/user-analytics/analytics/user-journey', filter);
      return response.data;
    } catch (error) {
      console.error('Error getting user journey:', error);
      throw error;
    }
  },
  
  /**
   * Get analytics dashboard overview data
   * (Admin only feature)
   */
  async getDashboardOverview(days = 7): Promise<any> {
    try {
      const response = await axiosClient.get(`/user-analytics/analytics/dashboard/overview?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      throw error;
    }
  },
  
  // Private helper methods
  _getDeviceInfo(): DeviceInfo {
    // Simple device detection - in a production app, consider using a more robust solution
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    let os = 'Unknown';
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Macintosh/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';
    
    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    
    let device_type = 'desktop';
    if (/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)) {
      device_type = 'mobile';
      if (/iPad/.test(userAgent) || (screenWidth > 768 && /Android/.test(userAgent))) {
        device_type = 'tablet';
      }
    }
    
    return {
      os,
      browser,
      device_type,
      screen_resolution: `${screenWidth}x${screenHeight}`
    };
  },
  
  _setupEventTracking(): void {
    if (!this.currentSession || typeof window === 'undefined') return;
    
    this.isCollectingEvents = true;
    
    // Set up batch sending interval
    this.batchTimer = setInterval(() => {
      if (this.pendingEvents.length > 0) {
        this._sendEventBatch();
      }
    }, this.batchInterval);
    
    // Track page views
    this._trackPageView();
    
    // Track clicks
    document.addEventListener('click', this._trackClick.bind(this), { passive: true });
    
    // Track form submissions
    document.addEventListener('submit', this._trackFormSubmit.bind(this), { passive: true });
    
    // Clean up when the page is unloaded
    window.addEventListener('beforeunload', () => {
      // Send any remaining events
      if (this.pendingEvents.length > 0) {
        // Use sendBeacon for better reliability during page unload
        const payload = JSON.stringify(this.pendingEvents);
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || ''}/user-analytics/events/batch`, payload);
        this.pendingEvents = [];
      }
    });
  },
  
  _trackPageView(): void {
    if (!this.currentSession) return;
    
    const path = window.location.pathname;
    const title = document.title;
    
    this.recordEvent({
      event_type: 'view',
      target_type: 'page',
      target_path: path,
      metadata: {
        title,
        url: window.location.href,
        referrer: document.referrer
      }
    });
  },
  
  _trackClick(event: MouseEvent): void {
    if (!this.currentSession || !event.target) return;
    
    // Get the clicked element
    const target = event.target as HTMLElement;
    
    // Find the closest button, link, or interactive element
    const button = target.closest('button');
    const link = target.closest('a');
    const interactive = target.closest('[role="button"], [role="link"], [role="tab"]');
    
    let elementToTrack = button || link || interactive || target;
    let targetType = 'element';
    
    if (button) targetType = 'button';
    else if (link) targetType = 'link';
    else if (interactive) targetType = elementToTrack.getAttribute('role') || 'interactive';
    
    // Get component name from data attribute if available
    const componentName = elementToTrack.closest('[data-component-name]')?.getAttribute('data-component-name');
    
    // Calculate element coordinates relative to viewport
    const rect = elementToTrack.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate relative position (0-1)
    const relativeX = centerX / window.innerWidth;
    const relativeY = centerY / window.innerHeight;
    
    this.recordEvent({
      event_type: 'click',
      target_type: targetType,
      target_id: elementToTrack.id || undefined,
      target_path: this._getElementPath(elementToTrack),
      component_name: componentName || undefined,
      x_position: relativeX,
      y_position: relativeY,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      metadata: {
        text: elementToTrack.textContent?.trim().substring(0, 100) || undefined,
        class: elementToTrack.className || undefined,
        href: link?.href || undefined
      }
    });
  },
  
  _trackFormSubmit(event: Event): void {
    if (!this.currentSession || !event.target) return;
    
    const form = event.target as HTMLFormElement;
    const formId = form.id || 'unknown-form';
    
    this.recordEvent({
      event_type: 'submit',
      target_type: 'form',
      target_id: formId,
      target_path: this._getElementPath(form),
      component_name: form.getAttribute('data-component-name') || undefined,
      metadata: {
        action: form.action || undefined,
        method: form.method || undefined,
        fields: Array.from(form.elements).map((el: any) => {
          if (el.name && !el.name.toLowerCase().includes('password')) {
            return el.name;
          }
          return null;
        }).filter(Boolean)
      }
    });
  },
  
  _getElementPath(element: HTMLElement): string {
    let path = '';
    let current = element;
    
    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const id = current.id ? `#${current.id}` : '';
      const classes = Array.from(current.classList).map(c => `.${c}`).join('');
      
      path = `${tag}${id}${classes} > ${path}`;
      current = current.parentElement as HTMLElement;
    }
    
    return path.slice(0, -3); // Remove trailing " > "
  },
  
  async _sendEventBatch(): Promise<void> {
    if (!this.currentSession || this.pendingEvents.length === 0) return;
    
    const eventsToSend = [...this.pendingEvents];
    this.pendingEvents = [];
    
    try {
      await axiosClient.post('/user-analytics/events/batch', eventsToSend, {
        headers: {
          'X-Session-Token': this.currentSession.session_token
        }
      });
    } catch (error) {
      console.error('Error sending event batch:', error);
      // Put events back in the queue to retry later
      this.pendingEvents = [...eventsToSend, ...this.pendingEvents];
    }
  }
};

export default AnalyticsService;
