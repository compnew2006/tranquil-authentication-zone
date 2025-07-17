import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useChats, useChatMessages, useSendMessage, useConnectionManager } from '@/hooks/useGowaApi';
import {
  Send,
  Phone,
  MoreVertical,
  Search,
  Plus,
  Clock,
  CheckCheck,
  MessageSquare,
  WifiOff,
  Loader2
} from 'lucide-react';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // API hooks
  const { status: connectionStatus, isLoading: connectionLoading } = useConnectionManager();
  const { data: chats = [], isLoading: chatsLoading } = useChats(searchTerm);
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(selectedChat);
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        chatJid: selectedChat,
        message: messageText
      });

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
      // Restore the message text if sending failed
      setNewMessage(messageText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const selectedContact = chats.find(c => c.id === selectedChat);
  const filteredContacts = chats.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  // Show connection status
  if (connectionLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Connecting to WhatsApp...</p>
        </div>
      </div>
    );
  }

  if (!connectionStatus?.connected) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">WhatsApp Not Connected</h3>
          <p className="text-muted-foreground mb-4">Please connect to WhatsApp first to access chats</p>
          <Button onClick={() => window.location.href = '/admin/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      
      {/* Contacts Sidebar */}
      <Card className="w-80 flex flex-col shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          {chatsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading chats...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No chats found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${
                  selectedChat === contact.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setSelectedChat(contact.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">{contact.name}</h4>
                    {contact.isOnline && (
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(contact.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {contact.lastMessage}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{contact.phone}</span>
                  {contact.unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col shadow-lg">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-semibold">{selectedContact.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{selectedContact.phone}</span>
                      {selectedContact.isOnline && (
                        <Badge variant="secondary" className="bg-success text-white">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start a conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <div className="flex">
                          {message.status === 'sent' && <Clock className="h-3 w-3" />}
                          {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                          {message.status === 'read' && <CheckCheck className="h-3 w-3 text-accent" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a contact to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Chat;