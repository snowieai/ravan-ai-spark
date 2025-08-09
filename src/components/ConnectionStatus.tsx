import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { testConnection } from '@/integrations/supabase/client';

interface ConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onConnectionChange }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage('');
    
    try {
      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        onConnectionChange?.(true);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Unknown connection error');
        onConnectionChange?.(false);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setErrorMessage('Network connection failed');
      onConnectionChange?.(false);
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Database connection established';
      case 'disconnected':
        return 'Database connection lost';
      case 'error':
        return `Connection error: ${errorMessage}`;
      case 'checking':
        return 'Checking database connection...';
      default:
        return 'Unknown connection status';
    }
  };

  const getAlertVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'default';
      case 'disconnected':
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (connectionStatus === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertDescription>{getStatusMessage()}</AlertDescription>
        </div>
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
          <Button
            onClick={retryConnection}
            disabled={isRetrying}
            size="sm"
            variant="outline"
          >
            {isRetrying ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default ConnectionStatus;