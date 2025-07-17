// Backend API response structures based on Go WhatsApp backend

export interface GowaBackendResponse<T> {
  status: number;
  code: string;
  message: string;
  results: T;
}

export interface PaginationResponse {
  limit: number;
  offset: number;
  total: number;
}

// Chat structures from backend
export interface ChatInfo {
  jid: string;
  name: string;
  last_message_time: string;
  ephemeral_expiration: number;
  created_at: string;
  updated_at: string;
}

export interface MessageInfo {
  id: string;
  chat_jid: string;
  sender_jid: string;
  content: string;
  timestamp: string;
  is_from_me: boolean;
  media_type: string;
  filename: string;
  url: string;
  file_length: number;
  created_at: string;
  updated_at: string;
}

export interface ListChatsResponse {
  data: ChatInfo[];
  pagination: PaginationResponse;
}

export interface GetChatMessagesResponse {
  data: MessageInfo[];
  pagination: PaginationResponse;
  chat_info: ChatInfo;
}

// Frontend mapped structures
export interface Chat {
  id: string; // mapped from jid
  name: string;
  phone: string; // extracted from jid
  lastMessage: string; // mapped from last message content
  timestamp: Date; // mapped from last_message_time
  unreadCount: number; // default 0 for now
  isOnline: boolean; // default false for now
}

export interface Message {
  id: string;
  text: string; // mapped from content
  timestamp: Date; // mapped from timestamp
  sender: 'user' | 'contact'; // mapped from is_from_me
  status: 'sent' | 'delivered' | 'read'; // default 'delivered' for now
}

// App connection status
export interface AppStatus {
  connected: boolean;
  qr_code?: string;
  pair_code?: string;
}

// Login response
export interface LoginResponse {
  qr_link: string;
  qr_duration: number;
}

export interface LoginWithCodeResponse {
  pair_code: string;
}

// API Error interface
export interface ApiErrorInfo {
  message: string;
  code?: string;
  status?: number;
}
