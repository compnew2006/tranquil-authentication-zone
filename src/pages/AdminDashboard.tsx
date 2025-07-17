import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const whatsappStatus = { connected: false }; // Mock status
  const navigate = useNavigate();

  // Mock data - replace with real API calls to GOWA backend
  const stats = {
    totalUsers: 1247,
    activeChats: 23,
    whatsappConnections: whatsappStatus.connected ? 1 : 0,
    systemHealth: 98.5
  };

  const recentActivity = [
    { id: 1, type: 'user_joined', user: 'john_doe', timestamp: '2 minutes ago', status: 'success' },
    { id: 2, type: 'chat_started', user: 'jane_smith', timestamp: '5 minutes ago', status: 'info' },
    { id: 3, type: 'whatsapp_connected', user: 'bob_wilson', timestamp: '10 minutes ago', status: 'success' },
    { id: 4, type: 'system_alert', user: 'system', timestamp: '15 minutes ago', status: 'warning' },
  ];



  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance and manage GOWA operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/whatsapp-connect')}
            className={whatsappStatus.connected ? "bg-success" : "bg-gradient-primary"}
          >
            {whatsappStatus.connected ? (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                WhatsApp Connected
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Connect WhatsApp
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-success">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChats}</div>
            <p className="text-xs text-muted-foreground">
              Real-time conversations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Bots</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsappConnections}</div>
            <p className="text-xs text-muted-foreground">
              Connected instances
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <p className="text-xs text-success">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {activity.status === 'info' && (
                      <Clock className="h-5 w-5 text-primary" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Connections */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>WhatsApp Connection</CardTitle>
            <CardDescription>
              Manage your WhatsApp connection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {whatsappStatus.connected ? (
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <Wifi className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">WhatsApp Connected</p>
                      <p className="text-xs text-muted-foreground">Ready to send and receive messages</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success">
                      Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/chat')}
                    >
                      Open Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted-foreground rounded-full flex items-center justify-center">
                      <WifiOff className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">WhatsApp Not Connected</p>
                      <p className="text-xs text-muted-foreground">Connect your WhatsApp to start messaging</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Disconnected
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => navigate('/whatsapp-connect')}
                      className="bg-gradient-primary"
                    >
                      <Smartphone className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional connection info */}
              <div className="text-xs text-muted-foreground">
                <p>• QR Code and Phone Number pairing supported</p>
                <p>• Secure connection with end-to-end encryption</p>
                <p>• Real-time message synchronization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;