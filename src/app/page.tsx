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
    image: "/assets/officers/Ibrahim.jpg",
    major: "Computer Science",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Keep it moving"
  },
  { 
    name: "Amaris Charles", 
    role: "Vice President", 
    year: "2024-25", 
    image: "/assets/officers/Amaris.jpeg",
    major: "Anthropology",
    homeCountry: "Puerto Rico",
    countryFlag: "🇵🇷",
    quote: "Something inspiring"
  },
  { 
    name: "Iman Mohammed", 
    role: "Secretary", 
    year: "2024-25", 
    image: "/assets/officers/Iman.jpeg",
    major: "Business Analytics",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Winter is coming"
  },
  { 
    name: "Shiori Hisaoka", 
    role: "Outreach Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/Shiori.jpeg",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵",
    quote: "Shinzuo Sasageyo"
  },
  { 
    name: "Mohammed Abubeker", 
    role: "Event Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/Mohammed.jpeg",
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

// Google Calendar API response types
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
    image: "/assets/officers/Amaris.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Vice President" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Vice President" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Vice President" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Vice President" }
    ],
    overallContributions: [
      "Founding Vice president who has led ISAB for a long time and had many meaningful contributions when it comes to managing the organization",
      "ISAB wouldn't be how it is today without her foundational leadership and continuous dedication",
      "Developed comprehensive event management strategies that established ISAB's signature programming approach",
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
    image: "/assets/officers/Ibrahim.jpg",
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
      "Greatly contributed to ISAB's international student support efforts",
      "Due to his job working as a student assistant in international affairs, he was familiar with a lot of things that were relevant to international students",
      "Provided expertise on immigration processes and campus resources for international students",
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
    image: "/assets/officers/Laura.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "International Student Support Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Secretary" }
    ],
    overallContributions: [
      "Created international student survey which was a comprehensive and well made survey which is still used by ISAB",
      "Served as secretary and helped organize Rhythms of the World",
      "Created systematic documentation processes that improved organizational continuity",
      "Served dual coordination and administrative roles ensuring organizational efficiency"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Conducted comprehensive needs assessment survey", "Co-organized Rhythms of the World"],
      "Secretary": ["Improved documentation systems", "Enhanced organizational continuity"]
    }
  },
  "chaehyeon-kim": {
    name: "Chaehyeon Kim", 
    major: "Art",
    homeCountry: "South Korea",
    countryFlag: "🇰🇷",
    image: "/assets/officers/Chaehyeon.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Communications Coordinator" }
    ],
    overallContributions: [
      "Helped with ISAB's initial growth on social media",
      "Made the first officer posts for the inaugural board team",
      "Developed content creation standards and brand guidelines for professional digital image",
      "Implemented strategic communication initiatives that increased student engagement during critical growth phase"
    ],
    roleSpecificHighlights: {
      "Communications Coordinator": ["Established social media presence", "Created first officer introduction posts"]
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
      "Organized first ever Songkran festival at UNT which was one of ISAB's biggest events that was foundational to its success today",
      "Organized many other events that were key to ISAB's development",
      "Developed innovative event planning frameworks that became template for future celebrations",
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
    image: "/assets/officers/Suma.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "International Student Support Coordinator" }
    ],
    overallContributions: [
      "Helped with student support during fall semester",
      "Helped with collecting data for town hall meetings, ensuring student voices were heard",
      "Helped organize events that were essential to ISAB's continued growth",
      "Supported the transition of new leadership during organizational growth phase"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Provided student support during fall semester", "Collected data for town hall meetings"]
    }
  },
  "marina-menegusso": {
    name: "Marina Cestari Menegusso",
    major: "English",
    homeCountry: "Brazil",
    countryFlag: "🇧🇷",
    image: "/assets/officers/Marina.jpg", 
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Outreach Coordinator" }
    ],
    overallContributions: [
      "Posted every event on time, ensuring consistent and timely promotion across social media platforms",
      "Took pictures during every event, helping document the history of ISAB and preserving organizational memory",
      "Helped collect data for officer bios, contributing to organizational documentation",
      "Helped grow the ISAB social media presence and engagement through strategic content creation"
    ],
    roleSpecificHighlights: {
      "Outreach Coordinator": ["Posted every event on time", "Documented ISAB history through photography"]
    }
  },
  "iman-mohammed": {
    name: "Iman Mohammed",
    major: "Business Analytics", 
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/Iman.jpeg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Secretary" },
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
  "shiori-hisaoka": {
    name: "Shiori Hisaoka",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵", 
    image: "/assets/officers/Shiori.jpeg",
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
  "mohammed-abubeker": {
    name: "Mohammed Abubeker",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/Mohammed.jpeg", 
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Outreach Coordinator" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Event Coordinator" }
    ],
    overallContributions: [
      "Continues ISAB's tradition of innovative cultural programming",
      "Organizes current semester events and community building activities",
      "Maintains high standards for event quality and student engagement"
    ],
    roleSpecificHighlights: {
      "Outreach Coordinator": ["Expanded ISAB's campus outreach", "Built community partnerships"],
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
    description: 'The pioneering leadership team that established ISAB from the ground up. This foundational board created the organizational framework, secured initial university recognition, and laid the groundwork for all future growth. Key achievements: Official ISAB establishment, initial member recruitment, and organizational charter development.',
    coverImage: '/assets/boards/founding-2023/cover.jpeg',
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
    description: 'The expansion era that transformed ISAB into a campus powerhouse. This dynamic 8-member team organized ISAB&apos;s first major events and established key traditions that continue today. Key achievements: Inaugural Songkran Festival, first Town Hall meeting, International Sash Ceremony, Vice Provost Luncheon, and UNT&apos;s first International Student Advisory Board recognition.',
    coverImage: '/assets/boards/spring-2024/cover.jpg',
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
    description: 'The consolidation period that strengthened ISAB&apos;s campus presence and enhanced student engagement. This experienced team focused on sustainable growth and community building. Key achievements: Football 101 cultural bridge event, Homecoming Week participation, Rhythms of the World celebration, comprehensive international student survey, and expanded social media presence.',
    coverImage: '/assets/boards/fall-2024/cover.jpeg',
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
    description: 'The current innovation-focused leadership driving ISAB toward new heights of impact and engagement. This streamlined 5-member team emphasizes quality programming and strategic growth. Ongoing initiatives: Second annual Songkran Festival, expanded town hall format, Valentine&apos;s Art Night, enhanced Google Calendar integration, and strengthened university partnerships.',
    coverImage: '/assets/boards/spring-2025/cover.jpeg',
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
    id: 'unt-field-day-2024',
    title: 'UNT Student Alumni Field Day',
    date: 'April 9, 2024',
    description: 'ISAB participation in UNT Student Alumni Field Day activities',
    coverImage: '/assets/gallery/fieldday/cover.jpg',
    totalImages: 10,
    images: [
      { url: '/assets/gallery/fieldday/1.jpg', caption: 'ISAB team at field day activities' },
      { url: '/assets/gallery/fieldday/2.jpg', caption: 'Students participating in games' },
      { url: '/assets/gallery/fieldday/3.jpg', caption: 'Alumni networking session' },
      { url: '/assets/gallery/fieldday/4.jpg', caption: 'Team building activities' }
    ]
  },
  {
    id: 'eve-nations-2024',
    title: 'Eve of Nations OU Trip',
    date: 'April 12, 2024',
    description: 'First annual trip to University of Oklahoma&apos;s cultural celebration',
    coverImage: '/assets/gallery/evenations/cover.jpg',
    totalImages: 16,
    images: [
      { url: '/assets/gallery/evenations/1.jpg', caption: 'Travel to University of Oklahoma' },
      { url: '/assets/gallery/evenations/2.jpg', caption: 'Cultural performances at OU' },
      { url: '/assets/gallery/evenations/3.jpg', caption: 'International food festival' },
      { url: '/assets/gallery/evenations/4.jpg', caption: 'ISAB group at OU campus' }
    ]
  },
  {
    id: 'songkran-2024',
    title: 'Songkran Water Festival',
    date: 'April 17, 2024',
    description: 'UNT&apos;s first-ever Songkran Festival celebration organized by Yong Pappunggon',
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
    id: 'vice-provost-luncheon-2024',
    title: 'International Affairs Vice Provost Luncheon',
    date: 'May 6, 2024',
    description: 'Luncheon meeting with International Affairs Vice Provost',
    coverImage: '/assets/gallery/luncheon/cover.jpg',
    totalImages: 8,
    images: [
      { url: '/assets/gallery/luncheon/1.jpg', caption: 'Meeting with Vice Provost' },
      { url: '/assets/gallery/luncheon/2.jpg', caption: 'Policy discussion session' },
      { url: '/assets/gallery/luncheon/3.jpg', caption: 'ISAB officers presenting initiatives' },
      { url: '/assets/gallery/luncheon/4.jpg', caption: 'Networking with administration' }
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
    id: 'fall-meeting-2024',
    title: 'First General Meeting Fall 24',
    date: 'August 26, 2024',
    description: 'Fall semester kickoff meeting with new and returning members',
    coverImage: '/assets/gallery/fallmeeting/cover.jpg',
    totalImages: 14,
    images: [
      { url: '/assets/gallery/fallmeeting/1.jpg', caption: 'Fall semester opening meeting' },
      { url: '/assets/gallery/fallmeeting/2.jpg', caption: 'New member welcomes' },
      { url: '/assets/gallery/fallmeeting/3.jpg', caption: 'Fall agenda presentation' },
      { url: '/assets/gallery/fallmeeting/4.jpg', caption: 'Student engagement activities' }
    ]
  },
  {
    id: 'general-member-meeting-2024',
    title: 'General Member Meeting',
    date: 'September 10, 2024',
    description: 'September general body meeting for ongoing initiatives',
    coverImage: '/assets/gallery/septmeeting/cover.jpg',
    totalImages: 10,
    images: [
      { url: '/assets/gallery/septmeeting/1.jpg', caption: 'September member meeting' },
      { url: '/assets/gallery/septmeeting/2.jpg', caption: 'Initiative updates presentation' },
      { url: '/assets/gallery/septmeeting/3.jpg', caption: 'Member discussions and feedback' },
      { url: '/assets/gallery/septmeeting/4.jpg', caption: 'Planning upcoming events' }
    ]
  },
  {
    id: 'employment-opportunities-2024',
    title: 'Employment Opportunities Meeting with ISA',
    date: 'September 24, 2024',
    description: 'Collaborative meeting with ISA focusing on employment opportunities for international students',
    coverImage: '/assets/gallery/employment/cover.jpg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/employment/1.jpg', caption: 'Employment workshop session' },
      { url: '/assets/gallery/employment/2.jpg', caption: 'Resume building guidance' },
      { url: '/assets/gallery/employment/3.jpg', caption: 'Career networking tips' },
      { url: '/assets/gallery/employment/4.jpg', caption: 'Q&A with career advisors' }
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
    id: 'homecoming-week-2024',
    title: 'Homecoming Week',
    date: 'October 28, 2024',
    description: 'ISAB participation in UNT Homecoming Week festivities',
    coverImage: '/assets/gallery/homecoming/cover.jpg',
    totalImages: 18,
    images: [
      { url: '/assets/gallery/homecoming/1.jpg', caption: 'ISAB homecoming booth' },
      { url: '/assets/gallery/homecoming/2.jpg', caption: 'Parade participation' },
      { url: '/assets/gallery/homecoming/3.jpg', caption: 'Spirit week activities' },
      { url: '/assets/gallery/homecoming/4.jpg', caption: 'Alumni engagement events' }
    ]
  },
  {
    id: 'game-night-1-2024',
    title: 'International Game Night',
    date: 'November 12, 2024',
    description: 'First international game night bringing cultures together through games',
    coverImage: '/assets/gallery/gamenight1/cover.jpg',
    totalImages: 15,
    images: [
      { url: '/assets/gallery/gamenight1/1.jpg', caption: 'International board games' },
      { url: '/assets/gallery/gamenight1/2.jpg', caption: 'Students learning new games' },
      { url: '/assets/gallery/gamenight1/3.jpg', caption: 'Cultural game exchanges' },
      { url: '/assets/gallery/gamenight1/4.jpg', caption: 'Friendly competition and fun' }
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
  },
  {
    id: 'spring-meeting-2025',
    title: 'First General Meeting Spring 25',
    date: 'January 28, 2025',
    description: 'Spring semester opening meeting with new goals and initiatives',
    coverImage: '/assets/gallery/springmeeting2025/cover.jpg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/springmeeting2025/1.jpg', caption: 'Spring 2025 kickoff meeting' },
      { url: '/assets/gallery/springmeeting2025/2.jpg', caption: 'New semester goals presentation' },
      { url: '/assets/gallery/springmeeting2025/3.jpg', caption: 'Member engagement activities' },
      { url: '/assets/gallery/springmeeting2025/4.jpg', caption: 'Planning spring events' }
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
    id: 'game-night-2-2025',
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
  },
  {
    id: 'town-hall-2-2025',
    title: 'International Town Hall 2',
    date: 'March 19, 2025',
    description: 'Second annual international student town hall addressing ongoing concerns',
    coverImage: '/assets/gallery/townhall2/cover.jpg',
    totalImages: 14,
    images: [
      { url: '/assets/gallery/townhall2/1.jpg', caption: 'Second town hall session' },
      { url: '/assets/gallery/townhall2/2.jpg', caption: 'Student concerns discussion' },
      { url: '/assets/gallery/townhall2/3.jpg', caption: 'Administrative responses' },
      { url: '/assets/gallery/townhall2/4.jpg', caption: 'Community feedback session' }
    ]
  },
  {
    id: 'eid-gala-2025',
    title: 'Eid Gala with ISA',
    date: 'April 6, 2025',
    description: 'Collaborative Eid celebration with International Student Association',
    coverImage: '/assets/gallery/eidgala/cover.jpg',
    totalImages: 22,
    images: [
      { url: '/assets/gallery/eidgala/1.jpg', caption: 'Eid celebration decorations' },
      { url: '/assets/gallery/eidgala/2.jpg', caption: 'Traditional Eid festivities' },
      { url: '/assets/gallery/eidgala/3.jpg', caption: 'Cultural performances' },
      { url: '/assets/gallery/eidgala/4.jpg', caption: 'Community celebration' }
    ]
  },
  {
    id: 'eve-nations-2025',
    title: 'Eve of Nations OU Trip 2',
    date: 'April 11, 2025',
    description: 'Second annual trip to University of Oklahoma&apos;s cultural celebration',
    coverImage: '/assets/gallery/evenations2/cover.jpg',
    totalImages: 18,
    images: [
      { url: '/assets/gallery/evenations2/1.jpg', caption: 'Second annual OU trip' },
      { url: '/assets/gallery/evenations2/2.jpg', caption: 'Expanded cultural participation' },
      { url: '/assets/gallery/evenations2/3.jpg', caption: 'Inter-university collaboration' },
      { url: '/assets/gallery/evenations2/4.jpg', caption: 'Growing ISAB presence' }
    ]
  },
  {
    id: 'songkran-2025',
    title: 'Songkran Water Festival 2',
    date: 'April 14, 2025',
    description: 'Second annual Thai New Year celebration with expanded programming',
    coverImage: '/assets/gallery/songkran2025/cover.jpg',
    totalImages: 25,
    images: [
      { url: '/assets/gallery/songkran2025/1.jpg', caption: 'Second annual Songkran festival' },
      { url: '/assets/gallery/songkran2025/2.jpg', caption: 'Expanded water blessing ceremonies' },
      { url: '/assets/gallery/songkran2025/3.jpg', caption: 'Traditional Thai performances' },
      { url: '/assets/gallery/songkran2025/4.jpg', caption: 'Growing community participation' }
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
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                <Image
                  src="/assets/logo/ISAB Logo (Cropped).PNG"
                  alt="ISAB Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  className="rounded-xl transition-transform duration-300 hover:scale-110 shadow-sm"
                />
              </div>
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
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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
                  <h3 className="text-xl font-bold text-white mb-2">{officer.name}</h3>
                  <p className="text-white/90 font-medium mb-1">{officer.role}</p>
                  <p className="text-white/70 text-sm mb-4">{officer.year}</p>
                  
                  {/* Visual hint that the card is clickable */}
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

      {/* Officer Modal */}
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
      <div className="w-full">
        {/* History Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src="/assets/banners/history-banner.jpg"
            alt="ISAB History"
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Our Legacy</h1>
              <p className="text-lg sm:text-xl md:text-2xl opacity-90">Celebrating ISAB's Journey of Growth and Impact</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
          <div className="max-w-4xl mx-auto">
            
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
                      <p className="text-primary font-medium text-sm mb-3">{board.period}</p>
                      <p className="text-muted-foreground leading-relaxed text-sm">{board.description}</p>
                      
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
      </div>
    );
  }

  // Individual semester board view
  if (currentBoard) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Header with back button */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              onClick={closeBoardView}
              className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start"
            >
              <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 mr-2 rotate-180" />
              Back to History
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{currentBoard.title}</h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">{currentBoard.period} • {currentBoard.totalOfficers} officers</p>
            </div>
          </div>

          {/* Board description */}
          <Card className="mb-8 shadow-card-hover border-border bg-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{currentBoard.description}</p>
            </CardContent>
          </Card>

          {/* Officers grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBoard.officers.map((officer, index) => {
              const profile = masterOfficerProfiles[officer.id];
              if (!profile) return null;
              
              return (
                <Card 
                  key={index} 
                  className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card cursor-pointer hover:-translate-y-1"
                  onClick={() => openOfficerModal(officer.id, officer.role)}
                >
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
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">Event Gallery</h1>
        <p className="text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base md:text-lg">
          Click on any event folder to view photos from that event
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={closeEventGallery}
            className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start"
          >
            <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 mr-2 rotate-180" />
            Back to Gallery
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{currentEvent.title}</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">{currentEvent.date} • {currentEvent.totalImages} photos</p>
          </div>
        </div>

        {/* Event description */}
        <Card className="mb-8 shadow-card-hover border-border bg-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{currentEvent.description}</p>
          </CardContent>
        </Card>

        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
      {/* Header with sync controls */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">ISAB Events</h1>
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <div className="min-h-screen bg-background w-full">
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