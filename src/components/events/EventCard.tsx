"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, MapPin, Users } from 'lucide-react';

interface Event {
  date: Date;
  title: string;
  time: string;
  location: string;
  description: string;
  id: string;
  googleCalendarLink: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer: string;
  isAllDay: boolean;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
          
          <Button 
            variant="ghost" 
            onClick={() => window.open(event.googleCalendarLink, '_blank')}
            className="flex items-center space-x-1 h-8 px-3 py-1 text-xs"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">Time:</span>
            <span className="ml-2">
              {event.isAllDay ? 'All Day' : event.time}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Location:</span>
              <span className="ml-2">{event.location}</span>
            </div>
          )}
          {event.organizer && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Organizer:</span>
              <span className="ml-2">{event.organizer}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="mt-4 text-muted-foreground leading-relaxed">{event.description}</p>
        )}
        
        {event.status && event.status !== 'confirmed' && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              event.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
              event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.status}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
