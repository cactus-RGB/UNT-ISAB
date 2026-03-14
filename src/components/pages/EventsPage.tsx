"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, MapPin, Users, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { useISABEvents } from '../../hooks/useISABEvents';
import { fadeUp, staggerContainer, cardEntrance, smoothTransition, cardTransition, viewportOnce } from '@/lib/motion';

interface ISABEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
  creator: { email: string; displayName: string };
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

const convertToDisplayFormat = (e: ISABEvent): DisplayEvent => ({
  date: e.start,
  title: e.title,
  time: e.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  location: e.location || 'TBA',
  description: e.description || 'More details to be announced',
  id: e.id,
  googleCalendarLink: e.htmlLink,
  status: e.status,
  organizer: e.creator.displayName,
  isAllDay: e.start.getHours() === 9 && e.start.getMinutes() === 0,
});

const getEventsForDate = (date: Date, events: DisplayEvent[]) =>
  events.filter(e =>
    e.date.getDate()     === date.getDate()  &&
    e.date.getMonth()    === date.getMonth() &&
    e.date.getFullYear() === date.getFullYear()
  );

const statusColors: Record<string, string> = {
  tentative:  'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  cancelled:  'bg-red-900/30    text-red-400    border-red-700/40',
};

export default function EventsPage({ date, onDateSelect }: EventsPageProps) {
  const { events: googleEvents, loading, error } = useISABEvents();
  const events         = googleEvents.map(convertToDisplayFormat);
  const selectedDateEvents = getEventsForDate(date, events);
  const upcomingEvents = events.filter(e => e.date >= new Date()).slice(0, 3);
  const eventDates     = events.map(e => e.date);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">

      {/* Header */}
      <motion.div
        className="mb-10 sm:mb-14"
        initial="hidden" whileInView="visible" viewport={viewportOnce}
        variants={fadeUp} transition={smoothTransition}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-2">
          ISAB <span className="text-gradient inline-block pb-[0.15em]">Events</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Browse upcoming events and check what&apos;s happening on any date
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          className="mb-8 p-5 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-3"
          initial="hidden" animate="visible" variants={fadeUp} transition={smoothTransition}
        >
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive text-sm mb-0.5">Calendar Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Calendar + date events */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
        initial="hidden" whileInView="visible" viewport={viewportOnce}
        variants={staggerContainer}
      >
        {/* Calendar */}
        <motion.div variants={cardEntrance} transition={cardTransition}>
          <Card className="border-border bg-card shadow-card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Event Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                events={eventDates}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Day view */}
        <motion.div variants={cardEntrance} transition={cardTransition} className="lg:col-span-2">
          <Card className="border-border bg-card shadow-card-hover h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event, i) => (
                    <div key={i} className="relative p-5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors duration-200 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                      <div className="ml-3">
                        <h3 className="text-base font-bold text-foreground mb-3">{event.title}</h3>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span>{event.isAllDay ? 'All Day' : event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.organizer && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span>{event.organizer}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <div
                            className="mt-3 text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_*]:text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                          />
                        )}
                        {event.status && event.status !== 'confirmed' && (
                          <span className={`inline-flex mt-3 items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[event.status] ?? ''}`}>
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted/30 mb-4">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No events on this date</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Check out upcoming events below</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Upcoming events */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={viewportOnce}
        variants={fadeUp} transition={smoothTransition}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Upcoming Events
            <span className="ml-2 text-sm font-normal text-muted-foreground">({events.length} total)</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 rounded-2xl border border-border">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground font-medium">Loading events&hellip;</span>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden" animate="visible"
            variants={staggerContainer}
          >
            {upcomingEvents.map((event, i) => (
              <motion.div key={i} variants={cardEntrance} transition={cardTransition}>
                <a href={event.googleCalendarLink} target="_blank" rel="noopener noreferrer" className="block h-full">
                <div className="group relative h-full rounded-2xl border border-border bg-card overflow-hidden card-hover-glow transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-6">
                    {/* Date badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                        <CalendarIcon className="h-3 w-3" />
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.isAllDay ? 'All Day' : event.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {event.title}
                    </h3>

                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {event.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      View details <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <div className="p-4 rounded-full bg-muted/30 inline-block mb-4">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">No upcoming events found.</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
