// React hooks for GOWA API integration

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gowaApi } from '@/lib/api';

// Hook for app connection status
export const useAppStatus = () => {
  return useQuery({
    queryKey: ['app-status'],
    queryFn: () => gowaApi.getAppStatus(),
    refetchInterval: 5000, // Check status every 5 seconds
    retry: 3
  });
};

// Hook for WhatsApp login
export const useWhatsAppLogin = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: () => gowaApi.login(),
    onSuccess: () => {
      // Invalidate app status to refresh connection state
      queryClient.invalidateQueries({ queryKey: ['app-status'] });
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error);
      // If already logged in, refresh the status to show current state
      if (error.message?.includes('already logged in') || error.message?.includes('ALREADY_LOGGED_IN')) {
        queryClient.invalidateQueries({ queryKey: ['app-status'] });
      }
    }
  });

  const loginWithCodeMutation = useMutation({
    mutationFn: (phone: string) => gowaApi.loginWithCode(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-status'] });
    },
    onError: (error: any) => {
      console.error('Login with code mutation error:', error);
      // If already logged in, refresh the status to show current state
      if (error.message?.includes('already logged in') || error.message?.includes('ALREADY_LOGGED_IN')) {
        queryClient.invalidateQueries({ queryKey: ['app-status'] });
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => gowaApi.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-status'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const reconnectMutation = useMutation({
    mutationFn: () => gowaApi.reconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-status'] });
    }
  });

  return {
    login: loginMutation.mutate,
    loginWithCode: loginWithCodeMutation.mutate,
    logout: logoutMutation.mutate,
    reconnect: reconnectMutation.mutate,
    isLoading: loginMutation.isPending || loginWithCodeMutation.isPending || 
               logoutMutation.isPending || reconnectMutation.isPending,
    error: loginMutation.error || loginWithCodeMutation.error || 
           logoutMutation.error || reconnectMutation.error,
    loginData: loginMutation.data,
    loginWithCodeData: loginWithCodeMutation.data
  };
};

// Hook for chat list
export const useChats = (search?: string) => {
  return useQuery({
    queryKey: ['chats', search],
    queryFn: () => gowaApi.getChats(25, 0, search),
    enabled: true, // Always enabled, will return empty if not connected
    retry: 2
  });
};

// Hook for chat messages
export const useChatMessages = (chatJid: string | null) => {
  return useQuery({
    queryKey: ['chat-messages', chatJid],
    queryFn: () => chatJid ? gowaApi.getChatMessages(chatJid) : Promise.resolve([]),
    enabled: !!chatJid,
    retry: 2
  });
};

// Hook for sending messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatJid, message }: { chatJid: string; message: string }) =>
      gowaApi.sendMessage(chatJid, message),
    onSuccess: (_, variables) => {
      // Invalidate and refetch messages for this chat
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', variables.chatJid] 
      });
      // Also invalidate chats list to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });
};

// Hook for real-time updates (polling-based for now)
export const useRealTimeUpdates = (enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Refresh chats and app status periodically
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['app-status'] });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [enabled, queryClient]);
};

// Hook for connection management
export const useConnectionManager = () => {
  const { data: status, isLoading } = useAppStatus();
  const { login, loginWithCode, logout, reconnect } = useWhatsAppLogin();
  const [autoReconnect, setAutoReconnect] = useState(true);

  // Auto-reconnect logic
  useEffect(() => {
    if (autoReconnect && status && !status.connected && !isLoading) {
      const timer = setTimeout(() => {
        console.log('Attempting auto-reconnect...');
        reconnect();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, autoReconnect, isLoading, reconnect]);

  return {
    status,
    isLoading,
    login,
    loginWithCode,
    logout,
    reconnect,
    autoReconnect,
    setAutoReconnect
  };
};
