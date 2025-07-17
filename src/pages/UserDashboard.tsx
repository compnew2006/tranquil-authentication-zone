import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  MessageCircle, 
  Clock,
  CheckCircle,
  Settings,
  Plus,
  Zap
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  // Mock data - replace with real API calls to GOWA backend
  const userStats = {
    totalChats: 47,
    activeConversations: 3,
    whatsappConnected: true,
    quickReplies: 12
  };

  const recentChats = [
    { id: 1, contact: 'John Customer', lastMessage: 'Thank you for your help!', timestamp: '2 minutes ago', status: 'resolved' },
    { id: 2, contact: 'Sarah Johnson', lastMessage: 'Can you help me with...', timestamp: '15 minutes ago', status: 'active' },
    { id: 3, contact: 'Mike Wilson', lastMessage: 'Perfect, thanks!', timestamp: '1 hour ago', status: 'resolved' },
    { id: 4, contact: 'Lisa Brown', lastMessage: 'I need assistance with...', timestamp: '2 hours ago', status: 'pending' },
  ];

  const quickActions = [
    { title: 'Start New Chat', icon: MessageSquare, color: 'bg-primary', action: () => {} },
    { title: 'WhatsApp Settings', icon: MessageCircle, color: 'bg-secondary', action: () => {} },
    { title: 'Quick Replies', icon: Zap, color: 'bg-accent', action: () => {} },
    { title: 'Account Settings', icon: Settings, color: 'bg-muted', action: () => {} },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your conversations and settings
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalChats}</div>
            <p className="text-xs text-muted-foreground">
              All conversations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeConversations}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing conversations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to receive messages
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Replies</CardTitle>
            <Zap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.quickReplies}</div>
            <p className="text-xs text-muted-foreground">
              Templates available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Recent Conversations */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Your latest chat interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{chat.contact}</p>
                      <p className="text-xs text-muted-foreground">{chat.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                    </div>
                    <Badge 
                      variant={
                        chat.status === 'active' ? 'default' : 
                        chat.status === 'resolved' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        chat.status === 'active' ? 'bg-primary' :
                        chat.status === 'resolved' ? 'bg-success' :
                        'border-warning text-warning'
                      }
                    >
                      {chat.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 hover:bg-muted/50"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span>{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;