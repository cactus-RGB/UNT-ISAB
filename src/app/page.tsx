"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, ChevronRight, Users, CalendarIcon, BookOpen, Image as ImageIcon, Home, Clock, MapPin, X, GraduationCap, Globe, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Current officers data (Spring 2025 Board)
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

// Master officer profiles with complete bios and role progression
interface OfficerProfile {
  name: string;
  major: string;
  homeCountry: string;
  countryFlag: string;
  image: string;
  hasPhoto: boolean;
  roles: Array<{ semester: string; period: string; role: string }>;
  overallContributions: string[];
  roleSpecificHighlights: { [key: string]: string[] };
}

const masterOfficerProfiles: { [key: string]: OfficerProfile } = {
  "adrian-tam": {
    name: "Adrian \"Boss\" Tam",
    major: "Master's in Communication",
    homeCountry: "Malaysia",
    countryFlag: "🇲🇾",
    image: "/assets/officers/Boss.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding President" },
      { semester: "Spring 2024", period: "Spring 2024", role: "President" }
    ],
    overallContributions: [
      "Established the International Student Advisory Board and recruited founding members",
      "Provided foundational leadership that enabled ISAB's rapid growth and development", 
      "Created the organizational framework that continues to guide ISAB's mission today",
      "Led ISAB through its inaugural events and early recognition by university administration"
    ],
    roleSpecificHighlights: {
      "Founding President": ["Established ISAB as recognized student organization", "Recruited founding board members"],
      "President": ["Oversaw first major event implementations", "Established university partnerships"]
    }
  },
  "amaris-charles": {
    name: "Amaris Charles",
    major: "Anthropology", 
    homeCountry: "Puerto Rico",
    countryFlag: "🇵🇷",
    image: "/assets/officers/amaris.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Vice President" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Vice President" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Vice President" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Vice President" }
    ],
    overallContributions: [
      "Served as Vice President through ISAB's entire growth trajectory from founding to present",
      "Developed comprehensive event management strategies that established ISAB's signature programming approach",
      "Mentored incoming leadership and created sustainable organizational practices",
      "Spearheaded cultural initiatives that significantly enhanced international student engagement"
    ],
    roleSpecificHighlights: {
      "Founding Vice President": ["Co-established organizational structure", "Developed initial event frameworks"],
      "Vice President": ["Led major cultural celebrations", "Mentored new officer transitions"]
    }
  },
  "ibrahim-abubeker": {
    name: "Ibrahim Abubeker",
    major: "Computer Science",
    homeCountry: "Ethiopia", 
    countryFlag: "🇪🇹",
    image: "/assets/officers/ibrahim.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Secretary" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Secretary" },
      { semester: "Fall 2024", period: "Fall 2024", role: "President" },
      { semester: "Spring 2025", period: "Spring 2025", role: "President" }
    ],
    overallContributions: [
      "Rose from Founding Secretary to President, demonstrating exceptional leadership growth",
      "Maintained organizational continuity through detailed documentation and record-keeping",
      "Led ISAB's expansion phase as President with innovative programming and increased membership",
      "Strengthened university relationships and policy advocacy initiatives"
    ],
    roleSpecificHighlights: {
      "Founding Secretary": ["Established documentation protocols", "Maintained founding meeting records"],
      "Secretary": ["Streamlined organizational processes", "Improved member communication"],
      "President": ["Expanded event programming", "Increased membership engagement"]
    }
  },
  "bhavesh-gujula": {
    name: "Bhavesh Gujula",
    major: "Master's in Data Analytics",
    homeCountry: "India",
    countryFlag: "🇮🇳", 
    image: "/assets/officers/Bhavesh.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Treasurer" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Treasurer" }
    ],
    overallContributions: [
      "Secured initial funding and financial resources essential for ISAB's early operations",
      "Managed fiscal responsibilities for inaugural events that established ISAB's presence on campus", 
      "Developed financial protocols and procedures that laid the groundwork for sustainable operations",
      "Created budget frameworks that supported ISAB's rapid expansion of programming"
    ],
    roleSpecificHighlights: {
      "Founding Treasurer": ["Secured initial funding sources", "Established financial protocols"],
      "Treasurer": ["Managed first major event budgets", "Developed financial sustainability plans"]
    }
  },
  "sai-kaushik": {
    name: "Sai Kaushik Kollepalli",
    major: "Business Analytics",
    homeCountry: "India",
    countryFlag: "🇮🇳",
    image: "/assets/officers/Sai.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Essential Needs Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "International Student Support Coordinator" }
    ],
    overallContributions: [
      "Leveraged extensive knowledge from International Affairs assistant role to guide immigration processes",
      "Developed comprehensive support frameworks for international students navigating university systems",
      "Created resource databases and informational materials that streamlined access to critical services",
      "Served as vital bridge between international students and university administration"
    ],
    roleSpecificHighlights: {
      "Essential Needs Coordinator": ["Conducted student needs assessments", "Developed resource databases"],
      "International Student Support Coordinator": ["Provided immigration guidance", "Streamlined university processes"]
    }
  },
  "laura-decesero": {
    name: "Laura DeCesero",
    major: "Biomedical Engineering",
    homeCountry: "Italy",
    countryFlag: "🇮🇹",
    image: "/assets/officers/laura-decesero.jpeg",
    hasPhoto: false,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "International Student Support Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Secretary" }
    ],
    overallContributions: [
      "Designed and implemented comprehensive international student needs assessment survey",
      "Co-organized the inaugural 'Rhythms of the World' cultural celebration",
      "Created systematic documentation processes that improved organizational continuity",
      "Served dual coordination and administrative roles ensuring organizational efficiency"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Conducted needs assessment survey", "Co-organized Rhythms of the World"],
      "Secretary": ["Improved documentation systems", "Enhanced organizational continuity"]
    }
  },
  "chaehyeon-kim": {
    name: "Chaehyeon Kim", 
    major: "Art",
    homeCountry: "South Korea",
    countryFlag: "🇰🇷",
    image: "/assets/officers/chaehyeon.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Communications Coordinator" }
    ],
    overallContributions: [
      "Spearheaded ISAB's digital presence strategy and foundational social media framework",
      "Designed and produced inaugural officer introduction posts and visual identity templates",
      "Developed content creation standards and brand guidelines for professional digital image",
      "Implemented strategic communication initiatives that increased student engagement during critical growth phase"
    ],
    roleSpecificHighlights: {
      "Communications Coordinator": ["Established social media presence", "Created visual identity standards"]
    }
  },
  "yong-pappunggon": {
    name: "Yong Pappunggon",
    major: "Accounting", 
    homeCountry: "Thailand",
    countryFlag: "🇹🇭",
    image: "/assets/officers/Yong.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Event Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Event Coordinator" }
    ],
    overallContributions: [
      "Pioneered and executed UNT's first-ever Songkran Festival, creating landmark cultural event",
      "Developed innovative event planning frameworks that became template for future celebrations",
      "Successfully coordinated multiple high-impact events that attracted diverse audiences",
      "Established strategic partnerships with campus organizations and local community groups"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organized inaugural Songkran Festival", "Developed event planning frameworks"]
    }
  },
  "suma-geethika": {
    name: "Suma Geethika",
    major: "Data Science",
    homeCountry: "India", 
    countryFlag: "🇮🇳",
    image: "/assets/officers/suma.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "International Student Support Coordinator" }
    ],
    overallContributions: [
      "Provided essential student support services during ISAB's fall semester expansion",
      "Contributed to data collection and analysis for town hall meetings, ensuring student voices were heard",
      "Helped organize and coordinate multiple ISAB events throughout the semester",
      "Supported the transition of new leadership during organizational growth phase"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Provided student support during fall semester", "Collected data for town hall meetings"]
    }
  },
  "shiori-hisaoka": {
    name: "Shiori Hisaoka",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵", 
    image: "/assets/officers/shiori.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Event Coordinator" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Outreach Coordinator" }
    ],
    overallContributions: [
      "Contributed to expanding ISAB's event programming and community outreach initiatives",
      "Helped organize multiple cultural celebrations and student engagement activities",
      "Transitioned from event coordination to outreach, expanding ISAB's campus presence"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organized cultural celebrations", "Enhanced event programming"],
      "Outreach Coordinator": ["Expanded campus presence", "Increased student engagement"]
    }
  },
  "marina-menegusso": {
    name: "Marina Cestari Menegusso",
    major: "English",
    homeCountry: "Brazil",
    countryFlag: "🇧🇷",
    image: "/assets/officers/marina.jpg", 
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Outreach Coordinator" }
    ],
    overallContributions: [
      "Ensured timely promotion by posting every ISAB event consistently across social media platforms",
      "Documented ISAB's history by taking photographs during every event, preserving organizational memory",
      "Collected and organized data for officer biographical information, contributing to organizational documentation",
      "Significantly grew ISAB's social media presence and engagement through strategic content creation"
    ],
    roleSpecificHighlights: {
      "Outreach Coordinator": ["Posted every event on time", "Grew ISAB social media presence"]
    }
  },
  "iman-mohammed": {
    name: "Iman Mohammed",
    major: "Business Analytics", 
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/iman.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2025", period: "Spring 2025", role: "Secretary" }
    ],
    overallContributions: [
      "Maintains organizational documentation and communication standards",
      "Supports current ISAB initiatives and member coordination",
      "Contributes to ongoing policy advocacy and student support efforts"
    ],
    roleSpecificHighlights: {
      "Secretary": ["Maintains documentation standards", "Supports member coordination"]
    }
  },
  "mohammed-abubeker": {
    name: "Mohammed Abubeker",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/mohammed.jpeg", 
    hasPhoto: true,
    roles: [
      { semester: "Spring 2025", period: "Spring 2025", role: "Event Coordinator" }
    ],
    overallContributions: [
      "Continues ISAB's tradition of innovative cultural programming",
      "Organizes current semester events and community building activities",
      "Maintains high standards for event quality and student engagement"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organizes cultural programming", "Maintains event quality standards"]
    }
  }
};

// Semester boards with updated officer information
interface SemesterBoard {
  id: string;
  title: string;
  period: string;
  description: string;
  coverImage: string;
  totalOfficers: number;
  officers: Array<{ id: string; role: string }>;
}

const semesterBoards: SemesterBoard[] = [
  {
    id: 'founding-board-2023',
    title: 'Founding Board',
    period: 'December 2023',
    description: 'The pioneering leadership team that established ISAB and laid the foundation for its future growth',
    coverImage: '/assets/officers/Boss.jpg',
    totalOfficers: 4,
    officers: [
      { id: "adrian-tam", role: "Founding President" },
      { id: "amaris-charles", role: "Founding Vice President" },
      { id: "ibrahim-abubeker", role: "Founding Secretary" },
      { id: "bhavesh-gujula", role: "Founding Treasurer" }
    ]
  },
  {
    id: 'spring-2024-board',
    title: 'Spring 2024 Board', 
    period: 'Spring 2024',
    description: 'The dynamic team that drove ISAB\'s major growth phase, organizing landmark events and establishing key traditions',
    coverImage: '/assets/officers/amaris.jpeg',
    totalOfficers: 8,
    officers: [
      { id: "adrian-tam", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "ibrahim-abubeker", role: "Secretary" },
      { id: "bhavesh-gujula", role: "Treasurer" },
      { id: "sai-kaushik", role: "Essential Needs Coordinator" },
      { id: "laura-decesero", role: "International Student Support Coordinator" },
      { id: "chaehyeon-kim", role: "Communications Coordinator" },
      { id: "yong-pappunggon", role: "Event Coordinator" }
    ]
  },
  {
    id: 'fall-2024-board',
    title: 'Fall 2024 Board',
    period: 'Fall 2024', 
    description: 'The expanded leadership team that consolidated ISAB\'s growth and enhanced its campus presence',
    coverImage: '/assets/officers/ibrahim.jpeg',
    totalOfficers: 8,
    officers: [
      { id: "ibrahim-abubeker", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "laura-decesero", role: "Secretary" },
      { id: "suma-geethika", role: "International Student Support Coordinator" },
      { id: "sai-kaushik", role: "International Student Support Coordinator" },
      { id: "yong-pappunggon", role: "Event Coordinator" },
      { id: "shiori-hisaoka", role: "Event Coordinator" },
      { id: "marina-menegusso", role: "Outreach Coordinator" }
    ]
  },
  {
    id: 'spring-2025-board',
    title: 'Spring 2025 Board',
    period: 'Spring 2025',
    description: 'The current leadership team continuing ISAB\'s mission and expanding its impact on campus',
    coverImage: '/assets/officers/ibrahim.jpeg',
    totalOfficers: 5,
    officers: [
      { id: "ibrahim-abubeker", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "iman-mohammed", role: "Secretary" },
      { id: "shiori-hisaoka", role: "Outreach Coordinator" },
      { id: "mohammed-abubeker", role: "Event Coordinator" }
    ]
  }
];

// Event galleries based on actual ISAB timeline
const eventGalleries = [
  {
    id: 'inauguration-2024',
    title: 'ISAB Inauguration Ceremony',
    date: 'January 30, 2024',
    description: 'Official inauguration ceremony marking the beginning of ISAB as a recognized student organization',
    coverImage: '/assets/gallery/inauguration/cover.jpg',
    totalImages: 20,
    images: [
      { url: '/assets/gallery/inauguration/1.jpg', caption: 'Official inauguration ceremony' },
      { url: '/assets/gallery/inauguration/2.jpg', caption: 'Founding officers taking oath' },
      { url: '/assets/gallery/inauguration/3.jpg', caption: 'University officials present' },
      { url: '/assets/gallery/inauguration/4.jpg', caption: 'International student community gathering' }
    ]
  },
  {
    id: 'first-general-meeting-2024',
    title: '1st General Member Initiation',
    date: 'February 26, 2024',
    description: 'First general meeting welcoming new members to ISAB',
    coverImage: '/assets/gallery/gallery1.jpeg',
    totalImages: 15,
    images: [
      { url: '/assets/gallery/gallery1.jpeg', caption: 'First general member meeting' },
      { url: '/assets/gallery/first-meeting/2.jpg', caption: 'New member orientations' },
      { url: '/assets/gallery/first-meeting/3.jpg', caption: 'Officer introductions' },
      { url: '/assets/gallery/first-meeting/4.jpg', caption: 'Setting organizational goals' }
    ]
  },
  {
    id: 'town-hall-2024',
    title: 'International Student Town Hall',
    date: 'March 26, 2024',
    description: 'Open forum addressing international student concerns and needs',
    coverImage: '/assets/gallery/gallery2.jpeg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/gallery2.jpeg', caption: 'Town hall discussion panel' },
      { url: '/assets/gallery/townhall/2.jpg', caption: 'Students voicing concerns' },
      { url: '/assets/gallery/townhall/3.jpg', caption: 'University administration listening' },
      { url: '/assets/gallery/townhall/4.jpg', caption: 'Community building session' }
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
    id: 'sash-ceremony-2024',
    title: 'International Sash Ceremony',
    date: 'April 29, 2024',
    description: 'Honoring international students with traditional sash ceremony',
    coverImage: '/assets/gallery/sash/cover.jpg',
    totalImages: 18,
    images: [
      { url: '/assets/gallery/sash/1.jpg', caption: 'Sash ceremony preparation' },
      { url: '/assets/gallery/sash/2.jpg', caption: 'Students receiving honor sashes' },
      { url: '/assets/gallery/sash/3.jpg', caption: 'Cultural significance explained' },
      { url: '/assets/gallery/sash/4.jpg', caption: 'Group photo with sashes' }
    ]
  },
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
    id: 'trivia-night-2024',
    title: 'International Trivia Night',
    date: 'October 8, 2024',
    description: 'Fun trivia competition celebrating global knowledge and cultures',
    coverImage: '/assets/gallery/trivia/cover.jpg',
    totalImages: 16,
    images: [
      { url: '/assets/gallery/trivia/1.jpg', caption: 'Teams competing in trivia' },
      { url: '/assets/gallery/trivia/2.jpg', caption: 'Cultural questions round' },
      { url: '/assets/gallery/trivia/3.jpg', caption: 'Winning team celebration' },
      { url: '/assets/gallery/trivia/4.jpg', caption: 'Prize distribution' }
    ]
  },
  {
    id: 'rhythms-world-2024',
    title: 'Rhythms of the World',
    date: 'November 14, 2024',
    description: 'Cultural celebration showcasing global traditions, co-organized by Laura DeCesero',
    coverImage: '/assets/gallery/rhythms/cover.jpg',
    totalImages: 22,
    images: [
      { url: '/assets/gallery/rhythms/1.jpg', caption: 'Opening ceremony with international flags' },
      { url: '/assets/gallery/rhythms/2.jpg', caption: 'Traditional dance performances' },
      { url: '/assets/gallery/rhythms/3.jpg', caption: 'Cultural food showcase' },
      { url: '/assets/gallery/rhythms/4.jpg', caption: 'Students in traditional attire' },
      { url: '/assets/gallery/rhythms/5.jpg', caption: 'Interactive cultural booths' }
    ]
  },
  {
    id: 'valentines-art-2025',
    title: 'Valentine\'s Day Art Night',
    date: 'February 11, 2025',
    description: 'Creative art workshop celebrating love and friendship across cultures',
    coverImage: '/assets/gallery/valentines/cover.jpg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/valentines/1.jpg', caption: 'Art supplies setup' },
      { url: '/assets/gallery/valentines/2.jpg', caption: 'Students creating artwork' },
      { url: '/assets/gallery/valentines/3.jpg', caption: 'Cultural art traditions shared' },
      { url: '/assets/gallery/valentines/4.jpg', caption: 'Finished artwork display' }
    ]
  },
  {
    id: 'game-night-2025',
    title: 'International Game Night 2',
    date: 'March 5, 2025',
    description: 'Second iteration of popular international game night bringing cultures together',
    coverImage: '/assets/gallery/gallery3.jpeg',
    totalImages: 14,
    images: [
      { url: '/assets/gallery/gallery3.jpeg', caption: 'Students playing traditional games' },
      { url: '/assets/gallery/gamenight2/2.jpg', caption: 'Board games from different countries' },
      { url: '/assets/gallery/gamenight2/3.jpg', caption: 'Cultural game demonstrations' },
      { url: '/assets/gallery/gamenight2/4.jpg', caption: 'Friendly competition and laughter' }
    ]
  }
];

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
};

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-card/80 backdrop-blur-md shadow-card sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/logo/ISAB Logo (Cropped).PNG"
                alt="ISAB Logo"
                width={80}
                height={80}
                className="rounded-xl transition-transform duration-300 hover:scale-110 shadow-sm"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">ISAB</h1>
                <p className="text-sm text-muted-foreground">University of North Texas</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={currentPage === 'home' ? "default" : "ghost"}
                onClick={() => onPageChange('home')}
                className="flex items-center space-x-2 text-base"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Button>
              <Button 
                variant={currentPage === 'history' ? "default" : "ghost"}
                onClick={() => onPageChange('history')}
                className="flex items-center space-x-2 text-base"
              >
                <BookOpen className="h-5 w-5" />
                <span>History</span>
              </Button>
              <Button 
                variant={currentPage === 'gallery' ? "default" : "ghost"}
                onClick={() => onPageChange('gallery')}
                className="flex items-center space-x-2 text-base"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Gallery</span>
              </Button>
              <Button 
                variant={currentPage === 'events' ? "default" : "ghost"}
                onClick={() => onPageChange('events')}
                className="flex items-center space-x-2 text-base"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Events</span>
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
          
          {/* Profile image */}
          <div className="p-8 pb-4 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="rounded-full overflow-hidden w-32 h-32 relative">
                <Image
                  src={officer.image}
                  alt={`${officer.name} - ${officer.role}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="128px"
                />
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
  // Step 1: Add state management for the modal system
  const [selectedOfficer, setSelectedOfficer] = useState<typeof officers[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Step 2: Create functions to control the modal
  const openOfficerModal = (officer: typeof officers[0]) => {
    setSelectedOfficer(officer);  // Remember which officer was clicked
    setIsModalOpen(true);         // Show the modal
  };

  const closeOfficerModal = () => {
    setIsModalOpen(false);        // Hide the modal
    setSelectedOfficer(null);     // Clear the selected officer
  };

  // Step 3: Add keyboard support (ESC key to close modal)
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
      <header className="bg-primary-gradient text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight whitespace-nowrap">
              International Student Advisory Board
            </h1>
            <p className="text-xl mb-8 opacity-90">Empowering international students at the University of North Texas</p>
            <Button 
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-50 shadow-lg border-2 border-green-600 font-semibold"
              onClick={() => onPageChange('history')}
            >
              Learn More <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20 container mx-auto px-6">
        <Card className="mb-16 shadow-card-hover border-border bg-card">
          <CardHeader className="pb-6">
            <CardTitle className="text-4xl font-bold flex items-center text-foreground">
              <BookOpen className="mr-3 text-primary" /> About ISAB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, 
              fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.
            </p>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4 flex items-center text-foreground">
            <Users className="mr-3 text-primary" /> Current Officers
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            Click on any officer card to view their detailed information including major, home country, and personal quote
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officers.map((officer, index) => (
              <div
                key={index}
                onClick={() => openOfficerModal(officer)}
                className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-card hover:-translate-y-2 cursor-pointer rounded-lg overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="rounded-full overflow-hidden w-32 h-32 relative transition-all duration-300">
                      <Image
                        src={officer.image}
                        alt={`${officer.name} - ${officer.role}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="128px"
                        className="transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{officer.name}</h3>
                  <p className="text-primary font-medium mb-1">{officer.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">{officer.year}</p>
                  
                  {/* Visual hint that the card is clickable */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-primary">Click to view bio →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-12 flex items-center text-foreground">
            <ExternalLink className="mr-3 text-primary" /> Important Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Step 5: Conditionally render the modal */}
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
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<(OfficerProfile & { currentRole?: string }) | null>(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [hoveredOfficer, setHoveredOfficer] = useState<string | null>(null);

  const openBoardView = (boardId: string) => {
    setSelectedBoard(boardId);
  };

  const closeBoardView = () => {
    setSelectedBoard(null);
  };

  const openOfficerModal = (officerId: string, role: string) => {
    const profile = masterOfficerProfiles[officerId];
    if (profile) {
      setSelectedOfficer({ ...profile, currentRole: role });
      setIsOfficerModalOpen(true);
    }
  };

  const closeOfficerModal = () => {
    setIsOfficerModalOpen(false);
    setSelectedOfficer(null);
  };

  // Get officer tenure badge
  const getOfficerBadge = (officerId: string): string => {
    const profile = masterOfficerProfiles[officerId];
    if (!profile) return "";
    
    const roleCount = profile.roles.length;
    if (roleCount === 1) {
      return profile.roles[0].semester.includes("Founding") ? "Founding Member" : "1 Semester";
    }
    return `${roleCount} Semesters`;
  };

  // Check if officer is continuing from previous semester
  const isReturningOfficer = (officerId: string, currentBoardId: string): boolean => {
    const profile = masterOfficerProfiles[officerId];
    if (!profile) return false;
    
    const boardIndex = semesterBoards.findIndex(board => board.id === currentBoardId);
    if (boardIndex <= 0) return false;
    
    const previousBoard = semesterBoards[boardIndex - 1];
    return previousBoard.officers.some(officer => officer.id === officerId);
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOfficerModalOpen) {
          closeOfficerModal();
        } else if (selectedBoard) {
          closeBoardView();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOfficerModalOpen, selectedBoard]);

  const currentBoard = selectedBoard ? semesterBoards.find(board => board.id === selectedBoard) : null;

  // Main history view
  if (!selectedBoard) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-12 text-foreground">Our History</h1>
          
          {/* Main History Content */}
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
                  initiative but quickly grew into a recognized student organization. The board was created 
                  to foster a welcoming environment for international students, advocating for their interests 
                  and enhancing their experience at UNT.
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
                    { title: "Growth & Impact", desc: "Since inauguration, ISAB has hosted over 25 major events including the inaugural Songkran Festival, Rhythms of the World, and multiple town halls, becoming a vital part of campus life." },
                    { title: "Policy Advocacy", desc: "ISAB has successfully influenced university policies through dedicated town halls and direct engagement with administration to better support international students." },
                    { title: "Cultural Celebrations", desc: "Organized landmark events like UNT's first Songkran Water Festival, International Sash Ceremony, and collaborative celebrations that have become annual traditions." },
                    { title: "Community Building", desc: "Established comprehensive support through events like Football 101, International Game Nights, and Employment Opportunities meetings to help international students integrate and succeed." }
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

          {/* Legacy of Leadership Section - Folder View */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground flex items-center">
              <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
              Legacy of Leadership
            </h2>
            <p className="text-muted-foreground mb-12 text-lg">
              Click on any semester board to view the officers who served during that period
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {semesterBoards.map((board, index) => (
                <Card 
                  key={index} 
                  className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2"
                  onClick={() => openBoardView(board.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={board.coverImage}
                      alt={board.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Officer count badge */}
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {board.totalOfficers} officers
                    </div>

                    {/* Leadership icon overlay */}
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {board.title}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-2">{board.period}</p>
                    <p className="text-muted-foreground leading-relaxed">{board.description}</p>
                    
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm text-primary font-medium">Click to view officers →</p>
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

  // Individual semester board view
  if (currentBoard) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={closeBoardView}
              className="mr-4 hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5 mr-2 rotate-180" />
              Back to History
            </Button>
            <div>
              <h1 className="text-5xl font-bold text-foreground">{currentBoard.title}</h1>
              <p className="text-muted-foreground text-lg mt-2">{currentBoard.period} • {currentBoard.totalOfficers} officers</p>
            </div>
          </div>

          {/* Board description */}
          <Card className="mb-8 shadow-card-hover border-border bg-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{currentBoard.description}</p>
            </CardContent>
          </Card>

          {/* Officers grid - Condensed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBoard.officers.map((officer, index) => {
              const profile = masterOfficerProfiles[officer.id];
              if (!profile) return null;
              
              const badge = getOfficerBadge(officer.id);
              const isReturning = isReturningOfficer(officer.id, currentBoard.id);
              const roleHighlights = profile.roleSpecificHighlights[officer.role] || [];
              
              return (
                <Card 
                  key={index} 
                  className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card cursor-pointer hover:-translate-y-1 relative"
                  onClick={() => openOfficerModal(officer.id, officer.role)}
                  onMouseEnter={() => setHoveredOfficer(officer.id)}
                  onMouseLeave={() => setHoveredOfficer(null)}
                >
                  {/* Hover tooltip for role-specific highlights */}
                  {hoveredOfficer === officer.id && roleHighlights.length > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-64">
                      <div className="font-medium mb-1">{officer.role} Highlights:</div>
                      {roleHighlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start text-xs opacity-90">
                          <span className="mr-1">•</span>
                          <span>{highlight}</span>
                        </div>
                      ))}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      {/* Photo */}
                      <div className="w-20 h-20 rounded-full border-2 border-primary/20 overflow-hidden mb-3">
                        {profile.hasPhoto && profile.image ? (
                          <Image
                            src={profile.image}
                            alt={`${profile.name} - ${officer.role}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary/60" />
                          </div>
                        )}
                      </div>

                      {/* Name and role */}
                      <h3 className="text-lg font-bold text-foreground mb-1">{profile.name}</h3>
                      <div className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full font-medium text-xs mb-2">
                        {officer.role}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="inline-flex items-center px-2 py-1 bg-secondary/80 text-secondary-foreground rounded-full text-xs">
                          {badge}
                        </span>
                        {isReturning && (
                          <span className="inline-flex items-center px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                            Returning
                          </span>
                        )}
                      </div>
                      
                      {/* Basic info */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-center">
                          <GraduationCap className="h-3 w-3 mr-1 text-primary" />
                          <span className="truncate">{profile.major}</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Globe className="h-3 w-3 mr-1 text-primary" />
                          <span>{profile.countryFlag} {profile.homeCountry}</span>
                        </div>
                      </div>

                      {/* Click hint */}
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-primary">Click for full bio →</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Full Bio Modal */}
          {isOfficerModalOpen && selectedOfficer && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeOfficerModal}
            >
              <div 
                className="bg-card rounded-2xl shadow-card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with close button */}
                <div className="relative">
                  <button
                    onClick={closeOfficerModal}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                  
                  {/* Profile image */}
                  <div className="p-8 pb-4 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="rounded-full overflow-hidden w-32 h-32 relative">
                        {selectedOfficer.hasPhoto && selectedOfficer.image ? (
                          <Image
                            src={selectedOfficer.image}
                            alt={`${selectedOfficer.name}`}
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
                  {/* Name and basic info */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedOfficer.name}</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-3">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{selectedOfficer.major}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{selectedOfficer.countryFlag} {selectedOfficer.homeCountry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role progression timeline */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">ISAB Journey</h3>
                    <div className="space-y-2">
                      {selectedOfficer.roles.map((roleInfo, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <div className="flex-grow">
                            <span className="font-medium text-foreground">{roleInfo.role}</span>
                            <span className="text-muted-foreground text-sm ml-2">({roleInfo.period})</span>
                          </div>
                          {roleInfo.role === selectedOfficer.currentRole && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Current View</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall contributions */}
                  <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                    <h4 className="font-semibold text-foreground mb-3">Overall Contributions to ISAB</h4>
                    <ul className="space-y-2">
                      {selectedOfficer.overallContributions.map((contribution, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-muted-foreground leading-relaxed text-sm">{contribution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function GalleryPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
  };

  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Handle escape key to close lightbox or event gallery
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedImage) {
          closeLightbox();
        } else if (selectedEvent) {
          closeEventGallery();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedImage, selectedEvent]);

  const currentEvent = selectedEvent ? eventGalleries.find(event => event.id === selectedEvent) : null;

  // Main gallery view
  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-4 text-foreground">Event Gallery</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Click on any event folder to view photos from that event
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventGalleries.map((event, index) => (
            <Card 
              key={index} 
              className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2"
              onClick={() => openEventGallery(event.id)}
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Folder icon overlay */}
                <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                
                {/* Image count badge */}
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
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm text-primary font-medium">Click to view gallery →</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Individual event gallery view
  if (currentEvent) {
    return (
      <div className="container mx-auto px-6 py-20">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={closeEventGallery}
            className="mr-4 hover:bg-primary/10"
          >
            <ChevronRight className="h-5 w-5 mr-2 rotate-180" />
            Back to Gallery
          </Button>
          <div>
            <h1 className="text-5xl font-bold text-foreground">{currentEvent.title}</h1>
            <p className="text-muted-foreground text-lg mt-2">{currentEvent.date} • {currentEvent.totalImages} photos</p>
          </div>
        </div>

        {/* Event description */}
        <Card className="mb-8 shadow-card-hover border-border bg-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{currentEvent.description}</p>
          </CardContent>
        </Card>

        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentEvent.images.map((image, index) => (
            <Card 
              key={index} 
              className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-1"
              onClick={() => openLightbox(image.url)}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.caption}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* View icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              {image.caption && (
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{image.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Lightbox for full-size image viewing */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt="Gallery image"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="100vw"
                  className="cursor-pointer"
                  onClick={closeLightbox}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

interface EventsPageProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
}

function EventsPageDynamic({ date, onDateSelect }: EventsPageProps) {
  const { events: googleEvents, loading, error, lastUpdated, refresh } = useISABEvents();
  
  // Convert to display format
  const events = googleEvents.map(convertToDisplayFormat);
  
  const selectedDateEvents = getEventsForDate(date, events);
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .slice(0, 3);

  return (
    <div className="container mx-auto px-6 py-20">
      {/* Header with sync controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
        <h1 className="text-5xl font-bold text-foreground">ISAB Events</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Sync Status */}
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
          
          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={refresh}
              disabled={loading}
              className="flex items-center space-x-2 h-8 px-3 py-1 text-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>
            
            <Button 
              variant="default"
              onClick={() => window.open(`https://calendar.google.com/calendar/u/0?cid=${ISAB_CALENDAR_ID}`, '_blank')}
              className="flex items-center space-x-2 h-8 px-3 py-1 text-xs"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Manage Events</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-destructive bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive mb-1">Calendar Sync Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={refresh}
                  className="mt-3 h-8 px-3 py-1 text-xs"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Calendar and Events Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
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
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                          
                          {/* Google Calendar link */}
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
                        
                        {/* Status badge */}
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
                  <p className="text-muted-foreground/70">Check out our upcoming events below!</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {event.isAllDay ? 'All Day' : event.time}
                        </span>
                        <Button 
                          variant="ghost" 
                          onClick={() => window.open(event.googleCalendarLink, '_blank')}
                          className="h-8 px-3 py-1 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
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
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://calendar.google.com/calendar/u/0?cid=${ISAB_CALENDAR_ID}`, '_blank')}
                className="mt-4"
              >
                Add First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <div 
        className={`transition-all duration-200 ${
          isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {currentPage === 'home' && <HomePage onPageChange={handlePageChange} />}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'events' && <EventsPageDynamic date={date} onDateSelect={handleDateSelect} />}
      </div>
    </div>
  );
}