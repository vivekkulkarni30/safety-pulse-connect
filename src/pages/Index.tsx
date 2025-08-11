import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Settings, AlertCircle } from 'lucide-react';
import { EmergencyButton } from '@/components/EmergencyButton';
import { ContactsList, EmergencyContact } from '@/components/ContactsList';
import { LocationDisplay } from '@/components/LocationDisplay';
import { EmergencyAlert as EmergencyAlertComponent } from '@/components/EmergencyAlert';

interface EmergencyAlertData {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  contactsNotified: EmergencyContact[];
  status: 'sent' | 'delivered' | 'failed';
}

const Index = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recentAlert, setRecentAlert] = useState<EmergencyAlertData | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Get initial location
    getCurrentLocation();
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation({ lat: 0, lng: 0 });
        }
      );
    }
  };

  const handleAddContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts(prev => [...prev, newContact]);
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const handleEmergencyPress = (location: { lat: number; lng: number }) => {
    if (contacts.length === 0) {
      window.alert('Please add emergency contacts first!');
      return;
    }

    const emergencyAlert: EmergencyAlertData = {
      id: Date.now().toString(),
      timestamp: new Date(),
      location,
      contactsNotified: contacts,
      status: 'sent'
    };

    setRecentAlert(emergencyAlert);
    setIsEmergencyActive(true);

    // Simulate message delivery
    setTimeout(() => {
      setRecentAlert(prev => prev ? { ...prev, status: 'delivered' } : null);
    }, 2000);

    // Auto-clear emergency state after 5 minutes
    setTimeout(() => {
      setIsEmergencyActive(false);
    }, 300000);
  };

  const handleClearAlert = () => {
    setRecentAlert(null);
    setIsEmergencyActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-emergency" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emergency to-emergency-glow bg-clip-text text-transparent">
              SafeGuard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal safety companion. Press the emergency button to instantly alert your trusted contacts with your location.
          </p>
        </div>

        {/* Emergency Alert Display */}
        {recentAlert && (
          <div className="mb-8">
            <EmergencyAlertComponent alert={recentAlert} onClearAlert={handleClearAlert} />
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="emergency" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="emergency" className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emergency" className="space-y-8">
            <div className="text-center">
              <EmergencyButton 
                onEmergencyPress={handleEmergencyPress}
                isActivated={isEmergencyActive}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <LocationDisplay location={currentLocation} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Ready Contacts</span>
                  </CardTitle>
                  <CardDescription>
                    {contacts.length} contact{contacts.length !== 1 ? 's' : ''} will be notified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No emergency contacts added. Go to Contacts tab to add them.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="text-sm">
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-muted-foreground ml-2">{contact.phone}</span>
                        </div>
                      ))}
                      {contacts.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{contacts.length - 3} more contacts
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsList
              contacts={contacts}
              onAddContact={handleAddContact}
              onRemoveContact={handleRemoveContact}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
                <CardDescription>Configure your safety preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <h4 className="font-medium mb-2">About This Demo</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This is a demonstration of an emergency SOS app. In a real implementation, you would need:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>SMS/messaging service integration</li>
                    <li>Real-time location tracking</li>
    
                    <li>Emergency services integration</li>
                    <li>User authentication and data security</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-medium mb-2 text-warning">Privacy & Security</h4>
                  <p className="text-sm">
                    Your location data is only stored locally on your device and is only shared when you press the emergency button.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
