"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, MapPin, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useISABEvents } from '../../hooks/useISABEvents';

interface ISABEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
  creator: {
    email: string;
    displayName: string;
  };
}

interface DisplayEvent {
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

interface EventsPageProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
}

// Convert Google Calendar events to display format
const convertToDisplayFormat = (googleEvent: ISABEvent): DisplayEvent => ({
  date: googleEvent.start,
  title: googleEvent.title,
  time: googleEvent.start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }),
  location: googleEvent.location || 'TBA',
  description: googleEvent.description || 'More details to be announced',
  id: googleEvent.id,
  googleCalendarLink: googleEvent.htmlLink,
  status: googleEvent.status,
  organizer: googleEvent.creator.displayName,
  isAllDay: googleEvent.start.getHours() === 9 && googleEvent.start.getMinutes() === 0
});

// Get events for a specific date
const getEventsForDate = (date: Date, events: DisplayEvent[]) => {
  return events.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
};

export default function EventsPage({ date, onDateSelect }: EventsPageProps) {
  const { events: googleEvents, loading, error } = useISABEvents();
  
  // Convert to display format
  const events = googleEvents.map(convertToDisplayFormat);
  
  const selectedDateEvents = getEventsForDate(date, events);
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .slice(0, 3);

  // NEW: Get array of dates that have events for the calendar
  const eventDates = events.map(event => event.date);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">ISAB Events</h1>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-destructive bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive mb-1">Calendar Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Calendar and Events Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div className="lg:col-span-1">
          <Card className="shadow-card-hover border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                events={eventDates} // NEW: Pass event dates to show dots
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-card-hover border-border bg-card h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center">
                <CalendarIcon className="mr-2 text-primary" />
                Events for {date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event, index) => (
                    <Card key={index} className="border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-3">{event.title}</h3>
                        
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No events scheduled for this date.</p>
                  <p className="text-muted-foreground">Check out our upcoming events below!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Events */}
      <Card className="shadow-card-hover border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Upcoming Events ({events.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading events...</span>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {event.isAllDay ? 'All Day' : event.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming events found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}