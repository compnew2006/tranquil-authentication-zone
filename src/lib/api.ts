// API client for Go WhatsApp backend integration

import {
  GowaBackendResponse,
  ListChatsResponse,
  GetChatMessagesResponse,
  AppStatus,
  LoginResponse,
  LoginWithCodeResponse,
  Chat,
  Message,
  ChatInfo,
  MessageInfo
} from './types';

class GowaApiClient {
  private baseUrl: string;
  private apiKey: string;
  private basicAuthUser: string;
  private basicAuthPass: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_GOWA_API_URL || 'http://localhost:3000';
    this.apiKey = import.meta.env.VITE_GOWA_API_KEY || '';
    this.basicAuthUser = import.meta.env.VITE_GOWA_BASIC_AUTH_USER || 'admin';
    this.basicAuthPass = import.meta.env.VITE_GOWA_BASIC_AUTH_PASS || 'admin';
  }

  private getAuthHeaders(): HeadersInit {
    // Use dynamic credentials if available (set by AuthContext)
    const user = (window as any).__GOWA_AUTH_USER__ || this.basicAuthUser;
    const pass = (window as any).__GOWA_AUTH_PASS__ || this.basicAuthPass;

    const basicAuth = btoa(`${user}:${pass}`);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      ...(this.apiKey && { 'X-Api-Key': this.apiKey })
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GowaBackendResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      // Try to parse JSON error response
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.code || errorText;
      } catch {
        // If not JSON, use the raw text
      }

      throw new GowaApiError(errorMessage, undefined, response.status);
    }

    const data = await response.json();
    return data as GowaBackendResponse<T>;
  }

  // App connection methods
  async getAppStatus(): Promise<AppStatus> {
    try {
      const response = await this.request<any>('/app/status');
      // Backend returns: is_connected, is_logged_in, device_id
      return {
        connected: response.results?.is_connected || response.results?.is_logged_in || false,
        qr_code: response.results?.qr_code,
        pair_code: response.results?.pair_code
      };
    } catch (error) {
      console.error('Failed to get app status:', error);
      return { connected: false };
    }
  }

  async login(): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/app/login');
    return response.results;
  }

  async loginWithCode(phone: string): Promise<LoginWithCodeResponse> {
    const response = await this.request<LoginWithCodeResponse>(`/app/login-with-code?phone=${phone}`);
    return response.results;
  }

  async logout(): Promise<void> {
    await this.request('/app/logout');
  }

  async reconnect(): Promise<void> {
    await this.request('/app/reconnect');
  }

  // Chat methods
  async getChats(limit = 25, offset = 0, search?: string): Promise<Chat[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search })
    });

    const response = await this.request<ListChatsResponse>(`/chats?${params}`);
    return this.mapChatsToFrontend(response.results.data);
  }

  async getChatMessages(chatJid: string, limit = 50, offset = 0): Promise<Message[]> {
    // Prevent fetching messages for status broadcasts and other non-chat types
    if (chatJid.includes('status@broadcast') || chatJid.includes('@newsletter')) {
      console.warn(`Attempted to fetch messages for non-chat JID: ${chatJid}`);
      return [];
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await this.request<GetChatMessagesResponse>(
      `/chat/${encodeURIComponent(chatJid)}/messages?${params}`
    );
    return this.mapMessagesToFrontend(response.results.data);
  }

  // Send message
  async sendMessage(chatJid: string, message: string): Promise<void> {
    await this.request('/send/message', {
      method: 'POST',
      body: JSON.stringify({
        phone: chatJid,
        message: message
      })
    });
  }

  // Helper methods to map backend data to frontend structures
  private mapChatsToFrontend(chats: ChatInfo[]): Chat[] {
    // Filter out status broadcasts and other non-chat messages (WhatsApp Web style filtering)
    const filteredChats = chats.filter(chat => {
      const jid = chat.jid || '';

      // Exclude status broadcasts
      if (jid.includes('status@broadcast')) return false;

      // Exclude newsletter chats
      if (jid.includes('@newsletter')) return false;

      // Include only individual chats (ending with @s.whatsapp.net) and group chats (ending with @g.us)
      return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us');
    });

    return filteredChats.map(chat => ({
      id: chat.jid,
      name: chat.name || this.extractPhoneFromJid(chat.jid),
      phone: this.extractPhoneFromJid(chat.jid),
      lastMessage: 'No messages yet', // We'll need to get this from messages
      timestamp: new Date(chat.last_message_time || chat.updated_at),
      unreadCount: 0, // Backend doesn't provide this yet
      isOnline: false // Backend doesn't provide this yet
    }));
  }

  private mapMessagesToFrontend(messages: MessageInfo[]): Message[] {
    return messages.map(msg => ({
      id: msg.id,
      text: msg.content,
      timestamp: new Date(msg.timestamp),
      sender: msg.is_from_me ? 'user' : 'contact',
      status: 'delivered' // Default status for now
    }));
  }

  private extractPhoneFromJid(jid: string): string {
    // Extract phone number from JID format like "6289685028129@s.whatsapp.net"
    return jid.split('@')[0];
  }
}

// Create singleton instance
export const gowaApi = new GowaApiClient();

// Export error class
export class GowaApiError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'GowaApiError';
  }
}
