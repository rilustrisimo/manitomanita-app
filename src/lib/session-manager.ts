'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSession } from '@/app/actions/auth';

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Check if the current session needs refresh and refresh if necessary
   */
  async ensureValidSession(): Promise<boolean> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    const supabase = createSupabaseBrowserClient();
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('[SessionManager] No valid session found');
        return false;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
      
      if (expiresAt < fiveMinutesFromNow) {
        console.log('[SessionManager] Session expires soon, refreshing...');
        
        // Start refresh process
        this.refreshPromise = this.performRefresh();
        const result = await this.refreshPromise;
        this.refreshPromise = null;
        
        return result;
      }

      return true;
    } catch (error) {
      console.error('[SessionManager] Error checking session:', error);
      return false;
    }
  }

  private async performRefresh(): Promise<boolean> {
    const supabase = createSupabaseBrowserClient();
    
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        console.error('[SessionManager] Failed to refresh session:', error);
        return false;
      }

      // Update server session cookie
      await createSession(
        session.access_token,
        session.refresh_token,
        session.expires_at || Date.now() + (60 * 60 * 1000)
      );

      console.log('[SessionManager] Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('[SessionManager] Error during refresh:', error);
      return false;
    }
  }

  /**
   * Force refresh the session
   */
  async refreshSession(): Promise<boolean> {
    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
