import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyButtonProps {
  onEmergencyPress: (location: { lat: number; lng: number }) => void;
  isActivated: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ 
  onEmergencyPress, 
  isActivated 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const handleEmergencyPress = async () => {
    setIsPressed(true);
    setIsGettingLocation(true);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      onEmergencyPress(location);
      
      toast({
        title: "Emergency Alert Sent!",
        description: "Your location has been shared with emergency contacts.",
        className: "bg-success text-white"
      });

    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your location. Alert sent without location.",
        variant: "destructive"
      });
      
      // Send alert without location
      onEmergencyPress({ lat: 0, lng: 0 });
    } finally {
      setIsGettingLocation(false);
      setTimeout(() => setIsPressed(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Button
          onClick={handleEmergencyPress}
          disabled={isPressed || isGettingLocation}
          className={`
            relative w-48 h-48 rounded-full text-2xl font-bold
            transition-all duration-300 ease-out
            ${isActivated 
              ? 'bg-gradient-to-br from-success to-emerald-600 text-white shadow-lg' 
              : 'bg-gradient-to-br from-emergency to-red-600 text-emergency-foreground'
            }
            ${!isPressed && !isActivated ? 'animate-pulse-emergency hover:scale-105' : ''}
            ${isPressed ? 'scale-95 opacity-75' : ''}
            hover:shadow-2xl active:scale-95
            border-4 border-white/20
          `}
          style={{
            boxShadow: isActivated 
              ? '0 0 40px rgba(34, 197, 94, 0.4)' 
              : '0 0 40px rgba(239, 68, 68, 0.4)'
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            {isGettingLocation ? (
              <MapPin className="w-12 h-12 animate-pulse" />
            ) : isActivated ? (
              <Shield className="w-12 h-12" />
            ) : (
              <AlertTriangle className="w-12 h-12" />
            )}
            <span className="text-lg">
              {isGettingLocation ? 'Getting Location...' : 
               isActivated ? 'SAFE' : 'SOS'}
            </span>
          </div>
        </Button>
        
        {!isActivated && (
          <div className="absolute -inset-4 rounded-full animate-ping bg-emergency/30"></div>
        )}
      </div>

      <div className="text-center max-w-sm">
        <p className="text-muted-foreground text-sm">
          {isActivated 
            ? "Emergency services have been notified. You are safe."
            : "Press and hold the button to send emergency alert with your location to all your emergency contacts."
          }
        </p>
      </div>
    </div>
  );
};