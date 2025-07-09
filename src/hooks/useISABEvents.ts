// File: src/hooks/useISABEvents.ts
"use client"

import { useState, useEffect } from 'react';

const GOOGLE_CALENDAR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
const ISAB_CALENDAR_ID = process.env.NEXT_PUBLIC_ISAB_CALENDAR_ID;

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
  creator?: { email?: string; displayName?: string };
}

interface GoogleCalendarApiResponse {
  items?: GoogleCalendarEvent[];
}

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

export const useISABEvents = () => {
  const [events, setEvents] = useState<ISABEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = async () => {
    if (!GOOGLE_CALENDAR_API_KEY || !ISAB_CALENDAR_ID) {
      setError('Calendar configuration missing. Please add API key and Calendar ID to environment variables.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const now = new Date().toISOString();
      const maxResults = 50;
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ISAB_CALENDAR_ID)}/events?` +
        `key=${GOOGLE_CALENDAR_API_KEY}&` +
        `timeMin=${now}&` +
        `maxResults=${maxResults}&` +
        `singleEvents=true&` +
        `orderBy=startTime`;

      console.log('Fetching events from Google Calendar...');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Calendar access denied. Check API key and calendar permissions.');
        } else if (response.status === 404) {
          throw new Error('Calendar not found. Check calendar ID.');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: GoogleCalendarApiResponse = await response.json();
      console.log(`Found ${data.items?.length || 0} events`);
      
      const parsedEvents: ISABEvent[] = (data.items || []).map((event: GoogleCalendarEvent) => {
        // Handle both all-day and timed events
        const startDate = event.start.dateTime 
          ? new Date(event.start.dateTime)
          : new Date((event.start.date || new Date().toISOString().split('T')[0]) + 'T09:00:00'); // Default time for all-day events
          
        const endDate = event.end.dateTime 
          ? new Date(event.end.dateTime)
          : new Date((event.end.date || new Date().toISOString().split('T')[0]) + 'T17:00:00'); // Default end time for all-day events

        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          start: startDate,
          end: endDate,
          location: event.location || '',
          status: event.status,
          htmlLink: event.htmlLink,
          creator: {
            email: event.creator?.email || '',
            displayName: event.creator?.displayName || 'ISAB Officer'
          }
        };
      });
      
      setEvents(parsedEvents);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Refresh events every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    events, 
    loading, 
    error, 
    lastUpdated,
    refresh: fetchEvents 
  };
};