import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { EmergencyContact } from './ContactsList';

interface EmergencyAlert {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  contactsNotified: EmergencyContact[];
  status: 'sent' | 'delivered' | 'failed';
}

interface EmergencyAlertProps {
  alert: EmergencyAlert | null;
  onClearAlert: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  alert, 
  onClearAlert 
}) => {
  if (!alert) return null;

  const getStatusIcon = () => {
    switch (alert.status) {
      case 'sent':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (alert.status) {
      case 'sent':
        return 'Sending alerts...';
      case 'delivered':
        return 'Alerts delivered successfully';
      case 'failed':
        return 'Failed to send some alerts';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-l-4 border-l-emergency animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-emergency" />
            <span>Emergency Alert Sent</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAlert}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </CardTitle>
        <CardDescription>
          Alert sent at {formatTime(alert.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {alert.location.lat !== 0 && alert.location.lng !== 0 && (
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Location Shared</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Contacts Notified ({alert.contactsNotified.length})</h4>
          <div className="space-y-2">
            {alert.contactsNotified.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div>
                  <span className="font-medium text-sm">{contact.name}</span>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning-foreground">
            <strong>Important:</strong> This is a demo. In a real app, this would send actual SMS messages 
            to your emergency contacts with your location and emergency status.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};