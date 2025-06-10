"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, ChevronRight, Users, CalendarIcon, BookOpen, Image as ImageIcon, Home, Clock, MapPin, X, GraduationCap, Globe, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Current officers data (Spring 2025 Board) - FIXED
const officers = [
  { 
    name: "Ibrahim Abubeker", 
    role: "President", 
    year: "2024-25", 
    image: "/assets/officers/ibrahim.jpeg",
    major: "Computer Science",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Keep it moving"
  },
  { 
    name: "Amaris Charles", 
    role: "Vice President", 
    year: "2024-25", 
    image: "/assets/officers/amaris.jpeg",
    major: "Anthropology",
    homeCountry: "Puerto Rico",
    countryFlag: "🇵🇷",
    quote: "Something inspiring"
  },
  { 
    name: "Iman Mohammed", 
    role: "Secretary", 
    year: "2024-25", 
    image: "/assets/officers/iman.jpeg",
    major: "Business Analytics",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Winter is coming"
  },
  { 
    name: "Shiori Hisaoka", 
    role: "Outreach Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/shiori.jpeg",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵",
    quote: "Shinzuo Sasageyo"
  },
  { 
    name: "Mohammed Abubeker", 
    role: "Event Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/mohammed.jpeg",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Football is life"
  }
];

// Event galleries based on actual ISAB timeline - MOVED TO SEPARATE ARRAY
const eventGalleries = [
  {
    id: 'football-101-2024',
    title: 'Football 101',
    date: 'August 23, 2024',
    description: 'Educational event introducing international students to American football',
    coverImage: '/assets/gallery/football101/cover.jpg',
    totalImages: 14,
    images: [
      { url: '/assets/gallery/football101/1.jpg', caption: 'Learning football basics' },
      { url: '/assets/gallery/football101/2.jpg', caption: 'Rules explanation session' },
      { url: '/assets/gallery/football101/3.jpg', caption: 'Interactive demonstration' },
      { url: '/assets/gallery/football101/4.jpg', caption: 'Students trying on gear' }
    ]
  },
  {
    id: 'unt-etiquette-dinner-2024',
    title: 'UNT Etiquette Dinner',
    date: 'April 22, 2024',
    description: 'Professional etiquette dinner event for international students',
    coverImage: '/assets/gallery/etiquette/cover.jpg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/etiquette/1.jpg', caption: 'Formal dinner setting' },
      { url: '/assets/gallery/etiquette/2.jpg', caption: 'Students learning dining etiquette' },
      { url: '/assets/gallery/etiquette/3.jpg', caption: 'Professional presentation' },
      { url: '/assets/gallery/etiquette/4.jpg', caption: 'Group photo at dinner' }
    ]
  },
  {
    id: 'songkran-2024',
    title: 'Songkran Water Festival',
    date: 'April 17, 2024',
    description: 'UNT\'s first-ever Songkran Festival celebration organized by Yong Papunggon',
    coverImage: '/assets/gallery/songkran/cover.jpg',
    totalImages: 25,
    images: [
      { url: '/assets/gallery/songkran/1.jpg', caption: 'Traditional water blessing ceremony setup' },
      { url: '/assets/gallery/songkran/2.jpg', caption: 'Students enjoying water activities' },
      { url: '/assets/gallery/songkran/3.jpg', caption: 'Cultural performance during the festival' },
      { url: '/assets/gallery/songkran/4.jpg', caption: 'Traditional Thai decorations' },
      { url: '/assets/gallery/songkran/5.jpg', caption: 'Community gathering and celebration' },
      { url: '/assets/gallery/songkran/6.jpg', caption: 'Students participating in water blessing' }
    ]
  },
  {
    id: 'thanksgiving-picnic-2024',
    title: 'Thanksgiving Picnic',
    date: 'November 19, 2024',
    description: 'Thanksgiving celebration picnic for international students',
    coverImage: '/assets/gallery/thanksgiving/cover.jpg',
    totalImages: 20,
    images: [
      { url: '/assets/gallery/thanksgiving/1.jpg', caption: 'Thanksgiving feast setup' },
      { url: '/assets/gallery/thanksgiving/2.jpg', caption: 'International Thanksgiving dishes' },
      { url: '/assets/gallery/thanksgiving/3.jpg', caption: 'Gratitude sharing circle' },
      { url: '/assets/gallery/thanksgiving/4.jpg', caption: 'Community celebration' }
    ]
  }
];

// Important Links - Customize URLs here
const importantLinks = [
  { 
    title: "Join ISAB", 
    url: "https://unt.campuslabs.com/engage/organization/untisab", 
    description: "Become a member of our organization", 
    icon: Users 
  },
  { 
    title: "International Affairs Programs", 
    url: "https://international.unt.edu/programs-and-events/index.html", 
    description: "Programs and events for international students", 
    icon: CalendarIcon 
  },
  { 
    title: "UNT Resources", 
    url: "https://studentaffairs.unt.edu/push/unt-resources/index.html", 
    description: "Access UNT student resources", 
    icon: BookOpen
  }
];

// Google Calendar Integration Hook
const GOOGLE_CALENDAR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
const ISAB_CALENDAR_ID = process.env.NEXT_PUBLIC_ISAB_CALENDAR_ID;

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

const useISABEvents = () => {
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

      const data = await response.json();
      console.log(`Found ${data.items?.length || 0} events`);
      
      const parsedEvents: ISABEvent[] = (data.items || []).map((event: {
        id: string;
        summary?: string;
        description?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
        location?: string;
        status: 'confirmed' | 'tentative' | 'cancelled';
        htmlLink: string;
        creator?: { email?: string; displayName?: string };
      }) => {
        // Handle both all-day and timed events
        const startDate = event.start.dateTime 
          ? new Date(event.start.dateTime)
          : new Date(event.start.date + 'T09:00:00'); // Default time for all-day events
          
        const endDate = event.end.dateTime 
          ? new Date(event.end.dateTime)
          : new Date(event.end.date + 'T17:00:00'); // Default end time for all-day events

        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          start: startDate,
          end: endDate,
          location: event.location || '',
          status: event.status as 'confirmed' | 'tentative' | 'cancelled',
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

// Type for converted display events
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
  isAllDay: googleEvent.start.getHours() === 9 && googleEvent.start.getMinutes() === 0 // Detect all-day events
});

// Note: Additional officer profiles and semester board data can be added here when needed

// Get events for a specific date
const getEventsForDate = (date: Date, events: DisplayEvent[]) => {
  return events.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
}

interface HomePageProps {
  onPageChange: (page: string) => void;
}

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-card/80 backdrop-blur-md shadow-card sticky top-0 z-50 border-b border-border w-full">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image
                src="/assets/logo/ISAB Logo (Cropped).PNG"
                alt="ISAB Logo"
                width={60}
                height={60}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl transition-transform duration-300 hover:scale-110 shadow-sm"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">ISAB</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">University of North Texas</p>
              </div>
            </div>
            
            <div className="flex space-x-1 sm:space-x-2">
              <Button 
                variant={currentPage === 'home' ? "default" : "ghost"}
                onClick={() => onPageChange('home')}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button 
                variant={currentPage === 'history' ? "default" : "ghost"}
                onClick={() => onPageChange('history')}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button 
                variant={currentPage === 'gallery' ? "default" : "ghost"}
                onClick={() => onPageChange('gallery')}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2"
              >
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Gallery</span>
              </Button>
              <Button 
                variant={currentPage === 'events' ? "default" : "ghost"}
                onClick={() => onPageChange('events')}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2"
              >
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Events</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface OfficerModalProps {
  officer: typeof officers[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

function OfficerModal({ officer, isOpen, onClose }: OfficerModalProps) {
  if (!isOpen || !officer) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-card-elevated max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors duration-200"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          
          {/* Profile image - FIXED TYPE ISSUES */}
          <div className="p-8 pb-4 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="rounded-full overflow-hidden w-32 h-32 relative">
                {officer.image ? (
                  <Image
                    src={officer.image}
                    alt={`${officer.name} - ${officer.role}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary/60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Name and role */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{officer.name}</h2>
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
              {officer.role}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Major</p>
                <p className="font-medium text-foreground">{officer.major}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Home Country</p>
                <p className="font-medium text-foreground">
                  {officer.countryFlag} {officer.homeCountry}
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <p className="text-muted-foreground text-sm mb-1">Personal Quote</p>
            <blockquote className="text-foreground font-medium italic">
              &ldquo;{officer.quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onPageChange }: HomePageProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<typeof officers[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openOfficerModal = (officer: typeof officers[0]) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
  };

  const closeOfficerModal = () => {
    setIsModalOpen(false);
    setSelectedOfficer(null);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeOfficerModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  return (
    <>
      <header className="bg-primary-gradient text-primary-foreground py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-6xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              International Student Advisory Board
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">Empowering international students at the University of North Texas</p>
            <Button 
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-50 shadow-lg border-2 border-green-600 font-semibold w-full sm:w-auto"
              onClick={() => onPageChange('history')}
            >
              Learn More <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16 md:py-20 container mx-auto px-4 sm:px-6 w-full">
        <Card className="mb-12 sm:mb-16 shadow-card-hover border-border bg-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center text-foreground">
              <BookOpen className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> About ISAB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, 
              fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 flex items-center text-foreground">
            <Users className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> Current Officers
          </h2>
          <p className="text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base md:text-lg">
            Click on any officer card to view their detailed information including major, home country, and personal quote
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {officers.map((officer, index) => (
              <div
                key={index}
                onClick={() => openOfficerModal(officer)}
                className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-primary-gradient hover:-translate-y-2 cursor-pointer rounded-lg overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="rounded-full overflow-hidden w-32 h-32 relative transition-all duration-300">
                      {/* FIXED IMAGE COMPONENT TYPE ISSUES */}
                      {officer.image ? (
                        <Image
                          src={officer.image}
                          alt={`${officer.name} - ${officer.role}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="128px"
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                          <Users className="h-12 w-12 text-primary/60" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{officer.name}</h3>
                  <p className="text-white/90 font-medium mb-1">{officer.role}</p>
                  <p className="text-white/70 text-sm mb-4">{officer.year}</p>
                  
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-white font-medium">Click to view bio →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 flex items-center text-foreground">
            <ExternalLink className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> Important Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {importantLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Card key={index} className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold ml-4 text-foreground">{link.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{link.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (link.url.startsWith('mailto:')) {
                          window.location.href = link.url;
                        } else if (link.url !== '#') {
                          window.open(link.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      disabled={link.url === '#'}
                    >
                      Visit <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conditionally render the modal */}
      {isModalOpen && selectedOfficer && (
        <OfficerModal 
          officer={selectedOfficer}
          isOpen={isModalOpen}
          onClose={closeOfficerModal}
        />
      )}
    </>
  );
}

function HistoryPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-foreground">Our History</h1>
        
        <Card className="shadow-card-hover border-border bg-card mb-16">
          <CardContent className="p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center">
                <div className="w-2 h-8 bg-primary rounded-full mr-4"></div>
                Foundation
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The International Student Advisory Board (ISAB) at UNT was founded to amplify the voices 
                of international students, ensuring their concerns and needs are heard and addressed by 
                the university administration. Officially inaugurated on January 30, 2024, ISAB started as a small 
                initiative but quickly grew into a recognized student organization.
              </p>
              
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center">
                <div className="w-2 h-8 bg-primary rounded-full mr-4"></div>
                Mission
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our mission is to serve as the voice for international students at UNT, advocating 
                for their needs and fostering a welcoming community that celebrates diversity.
              </p>

              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center">
                <div className="w-2 h-8 bg-primary rounded-full mr-4"></div>
                Key Accomplishments
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Growth & Impact", desc: "Since inauguration, ISAB has hosted over 25 major events becoming a vital part of campus life." },
                  { title: "Policy Advocacy", desc: "ISAB has successfully influenced university policies through dedicated town halls and direct engagement with administration." },
                  { title: "Cultural Celebrations", desc: "Organized landmark events like UNT's first Songkran Water Festival and International Sash Ceremony." },
                  { title: "Community Building", desc: "Established comprehensive support through events like Football 101 and International Game Nights." }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Leadership */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground flex items-center">
            <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
            Current Leadership Team
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Meet our current officers who are leading ISAB into its next chapter of growth and impact.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.map((officer, index) => (
              <Card key={index} className="shadow-card-hover border-border bg-card hover:shadow-card-elevated transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/20 overflow-hidden mb-4">
                      {officer.image ? (
                        <Image
                          src={officer.image}
                          alt={`${officer.name} - ${officer.role}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary/60" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1">{officer.name}</h3>
                    <div className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full font-medium text-xs mb-2">
                      {officer.role}
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <GraduationCap className="h-3 w-3 mr-1 text-primary" />
                        <span className="truncate">{officer.major}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Globe className="h-3 w-3 mr-1 text-primary" />
                        <span>{officer.countryFlag} {officer.homeCountry}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
  };

  const currentEvent = selectedEvent ? eventGalleries.find(event => event.id === selectedEvent) : null;

  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-foreground">Event Gallery</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {eventGalleries.map((event, index) => (
            <Card 
              key={index} 
              className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2"
              onClick={() => openEventGallery(event.id)}
            >
              <div className="relative h-64 overflow-hidden">
                {/* FIXED IMAGE COMPONENT TYPE ISSUES */}
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-primary/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.totalImages} photos
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </h3>
                <p className="text-primary font-medium text-sm mb-2">{event.date}</p>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
        <Button 
          variant="ghost" 
          onClick={closeEventGallery}
          className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start"
        >
          <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 mr-2 rotate-180" />
          Back to Gallery
        </Button>
        {currentEvent && (
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{currentEvent.title}</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">{currentEvent.date}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface EventsPageProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
}

function EventsPageDynamic({ date, onDateSelect }: EventsPageProps) {
  const { events: googleEvents, loading, error, lastUpdated, refresh } = useISABEvents();
  
  const events = googleEvents.map(convertToDisplayFormat);
  const selectedDateEvents = getEventsForDate(date, events);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">ISAB Events</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 text-sm">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Syncing calendar...</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Sync failed</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">
                  Last synced: {lastUpdated?.toLocaleTimeString() || 'Never'}
                </span>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 h-8 px-3 py-1 text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

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
                        <h3 className="text-xl font-bold mb-3 text-foreground">{event.title}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-2">{event.isAllDay ? 'All Day' : event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">Location:</span>
                              <span className="ml-2">{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="mt-4 text-muted-foreground leading-relaxed">{event.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No events scheduled for this date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-primary-gradient text-primary-foreground py-6 sm:py-8 mt-auto w-full">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">ISAB at UNT</h3>
            <p className="text-primary-foreground/90 text-sm sm:text-base">
              Supporting international students and fostering cultural exchange at 
              the University of North Texas.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Contact Us</h3>
            <p className="text-primary-foreground/90 text-sm sm:text-base">Email: isab@unt.edu</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">
              <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 flex items-center text-sm sm:text-base">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ISABWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    
    setIsPageTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageTransitioning(false);
    }, 200);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <div 
        className={`transition-all duration-200 flex-grow ${
          isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {currentPage === 'home' && <HomePage onPageChange={handlePageChange} />}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'events' && <EventsPageDynamic date={date} onDateSelect={handleDateSelect} />}
      </div>
      <Footer />
    </div>
  );
}