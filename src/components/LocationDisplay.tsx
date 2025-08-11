import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface LocationDisplayProps {
  location: { lat: number; lng: number } | null;
  address?: string;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({ 
  location, 
  address 
}) => {
  if (!location || (location.lat === 0 && location.lng === 0)) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Location not available. Please allow location access for emergency alerts.
          </p>
        </CardContent>
      </Card>
    );
  }

  const googleMapsUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}`;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-accent" />
          <span>Current Location</span>
        </CardTitle>
        <CardDescription>
          This location will be shared in emergency alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {address && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{address}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Latitude:</span>
            <p className="font-mono">{location.lat.toFixed(6)}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Longitude:</span>
            <p className="font-mono">{location.lng.toFixed(6)}</p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-accent hover:underline text-sm"
        >
          <MapPin className="w-4 h-4" />
          <span>View on Google Maps</span>
        </a>
      </CardContent>
    </Card>
  );
};