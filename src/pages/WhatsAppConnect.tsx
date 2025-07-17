import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsAppLogin, useAppStatus } from '@/hooks/useGowaApi';
import { 
  Smartphone, 
  QrCode, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhatsAppConnect: React.FC = () => {
  const [connectionMethod, setConnectionMethod] = useState<'qr' | 'phone'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'method' | 'connecting' | 'connected'>('method');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const { toast } = useToast();
  const { refreshWhatsAppStatus } = useAuth();
  const { data: appStatus, isLoading: statusLoading } = useAppStatus();
  const { login, loginWithCode, logout, isLoading, error, loginData, loginWithCodeData } = useWhatsAppLogin();
  const navigate = useNavigate();

  // Countdown timer for QR code expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Handle QR code generation response
  useEffect(() => {
    if (loginData) {
      setQrCodeUrl(loginData.qr_link);
      setCountdown(loginData.qr_duration || 120);
      setStep('connecting');
    }
  }, [loginData]);

  // Handle phone pairing response
  useEffect(() => {
    if (loginWithCodeData) {
      toast({
        title: "Pairing code generated",
        description: `Your pairing code is: ${loginWithCodeData.pair_code}`,
      });
      setStep('connecting');
    }
  }, [loginWithCodeData, toast]);

  // Monitor connection status
  useEffect(() => {
    if (appStatus?.connected) {
      setStep('connected');
      toast({
        title: "WhatsApp Connected!",
        description: "Your WhatsApp account has been successfully connected.",
      });
    }
  }, [appStatus, toast]);

  const handleQRConnection = () => {
    try {
      login();
    } catch (error: any) {
      console.error('QR connection error:', error);

      // Handle specific error cases
      if (error.message?.includes('already logged in') || error.message?.includes('ALREADY_LOGGED_IN')) {
        toast({
          title: "Already Connected",
          description: "WhatsApp is already connected. Refreshing status...",
        });
        refreshWhatsAppStatus();
      } else {
        toast({
          title: "Failed to generate QR code",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePhoneConnection = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      loginWithCode(phoneNumber);
    } catch (error: any) {
      console.error('Phone connection error:', error);

      // Handle specific error cases
      if (error.message?.includes('already logged in') || error.message?.includes('ALREADY_LOGGED_IN')) {
        toast({
          title: "Already Connected",
          description: "WhatsApp is already connected. Refreshing status...",
        });
        refreshWhatsAppStatus();
      } else {
        toast({
          title: "Failed to generate pairing code",
          description: error.message || "Please check your phone number and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const refreshConnection = async () => {
    setQrCodeUrl(null);
    setCountdown(0);
    setStep('method');
    await refreshWhatsAppStatus();
  };

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Disconnected",
        description: "WhatsApp has been disconnected successfully.",
      });
      setStep('method');
      refreshWhatsAppStatus();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to disconnect WhatsApp.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (statusLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking WhatsApp connection status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">WhatsApp Connection</h1>
            <p className="text-muted-foreground">
              Connect your WhatsApp account to start managing conversations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {appStatus?.connected ? (
            <Badge className="bg-success">
              <Wifi className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      {step === 'connected' || appStatus?.connected ? (
        /* Connected State */
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">WhatsApp Connected Successfully!</CardTitle>
            <CardDescription>
              Your WhatsApp account is now connected and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate('/chat')} className="bg-gradient-primary">
                <Smartphone className="h-4 w-4 mr-2" />
                Start Chatting
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
            <div className="flex justify-center space-x-2">
              <Button variant="ghost" onClick={refreshConnection} className="text-sm">
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-sm">
                Disconnect WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : step === 'method' ? (
        /* Method Selection */
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className={`cursor-pointer transition-all ${connectionMethod === 'qr' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setConnectionMethod('qr')}>
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Scan QR code with your phone's WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleQRConnection}
                disabled={isLoading}
                className="w-full bg-gradient-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                Generate QR Code
              </Button>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${connectionMethod === 'phone' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setConnectionMethod('phone')}>
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <CardTitle>Phone Number</CardTitle>
              <CardDescription>
                Connect using your phone number and pairing code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handlePhoneConnection}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-gradient-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="h-4 w-4 mr-2" />
                )}
                Get Pairing Code
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Connecting State */
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Connecting to WhatsApp</CardTitle>
            <CardDescription>
              {connectionMethod === 'qr' 
                ? 'Scan the QR code with your WhatsApp mobile app'
                : 'Enter the pairing code in your WhatsApp mobile app'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {connectionMethod === 'qr' && qrCodeUrl ? (
              <div className="flex justify-center">
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-border">
                  <div className="w-64 h-64 flex items-center justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="WhatsApp QR Code" 
                      className="w-full h-full object-contain"
                      onError={() => {
                        // Fallback if image fails to load
                        setQrCodeUrl(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : connectionMethod === 'phone' && loginWithCodeData ? (
              <div className="bg-muted p-8 rounded-lg">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Pairing Code</h3>
                  <div className="text-4xl font-mono font-bold text-primary mb-4">
                    {loginWithCodeData.pair_code}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter this code in WhatsApp Settings → Linked Devices → Link a Device
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {countdown > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Expires in: <span className="font-mono font-medium">{formatTime(countdown)}</span>
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 120) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center space-x-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error.message}</span>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={refreshConnection}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')}>
                Change Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppConnect;
