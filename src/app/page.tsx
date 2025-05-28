"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, ChevronRight, Users, CalendarIcon, BookOpen, Image as ImageIcon, Home, Clock, MapPin, X, GraduationCap, Globe } from 'lucide-react';

// Officers data
const officers = [
  { 
    name: "Ibrahim Abubeker", 
    role: "President", 
    year: "2024-25", 
    image: "/assets/officers/ibrahim.jpeg",
    major: "Computer Science",
    homeCountry: "Ethiopia",
    countryFlag: "🌍",
    quote: "Live your life"
  },
  { 
    name: "Shiori Hisaoka", 
    role: "Vice President", 
    year: "2024-25", 
    image: "/assets/officers/shiori.jpeg",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🏯",
    quote: "Shinzuo Sasageyo"
  },
  { 
    name: "Iman Mohammed", 
    role: "Secretary", 
    year: "2024-25", 
    image: "/assets/officers/iman.jpeg",
    major: "Business Analytics",
    homeCountry: "Ethiopia",
    countryFlag: "🌍",
    quote: "Winter is coming"
  },
  { 
    name: "Mohammed Abubeker", 
    role: "Event Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/mohammed.jpeg",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🌍",
    quote: "Football is life"
  },

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

const events = [
  {
    date: new Date(2025, 4, 23), // May 23, 2025 (today)
    title: "General Body Meeting",
    time: "5:00 PM",
    location: "BLB 170",
    description: "Monthly meeting to discuss upcoming events and initiatives"
  },
  {
    date: new Date(2025, 4, 30), // May 30, 2025
    title: "International Culture Fair",
    time: "3:00 PM",
    location: "Union Courtyard",
    description: "Annual cultural showcase featuring performances and food from around the world"
  },
  {
    date: new Date(2025, 5, 10), // June 10, 2025
    title: "Professional Development Workshop",
    time: "4:30 PM",
    location: "BLB 080",
    description: "Resume building and networking skills workshop"
  },
  {
    date: new Date(2025, 5, 15), // June 15, 2025
    title: "Study Abroad Information Session",
    time: "2:00 PM",
    location: "Union Ballroom",
    description: "Learn about study abroad opportunities and application processes"
  }
];

// Past officers data
const pastOfficers = [
  {
    name: "Adrian \"Boss\" Tam",
    role: "Founding President",
    yearsServed: "Fall 2023 - Spring 2024",
    major: "Master's in Communication",
    homeCountry: "Malaysia",
    countryFlag: "🇲🇾",
    image: "/assets/officers/Boss.jpg",
    keyContributions: [
      "Established the International Student Advisory Board and recruited founding members",
      "Provided foundational leadership that enabled ISAB's rapid growth and development",
      "Created the organizational framework that continues to guide ISAB's mission today"
    ],
    hasPhoto: true
  },
  {
    name: "Amaris Charles",
    role: "Founding Vice President",
    yearsServed: "Spring 2024 - Spring 2025",
    major: "Anthropology",
    homeCountry: "Puerto Rico",
    //countryFlag: "🇵🇷",
    image: "/assets/officers/amaris.jpeg", // Using existing current officer photo
    keyContributions: [
      "Served as Founding Vice President, providing essential leadership during ISAB's formative period",
      "Developed comprehensive event management strategies that established ISAB's signature programming approach",
      "Mentored incoming leadership and created sustainable organizational practices that continue to drive ISAB's success",
      "Spearheaded cultural initiatives that significantly enhanced international student engagement and campus visibility"
    ],
    hasPhoto: true
  },
  {
    name: "Bhavesh Gujula",
    role: "Founding Treasurer",
    yearsServed: "Fall 2023 - Spring 2024", 
    major: "Master's in Data Analytics",
    homeCountry: "India",
    //countryFlag: "🇮🇳",
    image: "/assets/officers/Bhavesh.jpg",
    keyContributions: [
      "Secured initial funding and financial resources essential for ISAB's early operations",
      "Managed fiscal responsibilities for inaugural events that established ISAB's presence on campus",
      "Developed financial protocols and procedures that laid the groundwork for sustainable operations"
    ],
    hasPhoto: true
  },
  {
    name: "Sai Kaushik",
    role: "International Student Support Coordinator",
    yearsServed: "Spring 2024 - Fall 2024",
    major: "Business Analytics",
    homeCountry: "India",
    //countryFlag: "🇮🇳",
    image: "/assets/officers/Sai.jpg",
    keyContributions: [
      "Leveraged extensive knowledge from his role as International Affairs student assistant to provide expert guidance on immigration processes and campus resources",
      "Developed comprehensive support frameworks for international students navigating complex university systems and federal regulations",
      "Created resource databases and informational materials that streamlined access to critical student services",
      "Served as a vital bridge between international students and university administration, advocating for policy improvements based on firsthand experience"
    ],
    hasPhoto: true // Set to true when photo is available
  },
  {
    name: "Laura DeCesero",
    role: "Essential Needs Coordinator & Secretary",
    yearsServed: "Spring 2024 - Fall 2024",
    major: "Biomedical Engineering",
    homeCountry: "Italy",
    //countryFlag: "🇮🇹",
    image: "/assets/officers/laura-decesero.jpeg",
    keyContributions: [
      "Designed and implemented comprehensive international student needs assessment survey, providing critical data for university policy improvements",
      "Served dual roles as Secretary and Essential Needs Coordinator, ensuring organizational efficiency and student advocacy",
      "Co-organized the inaugural 'Rhythms of the World' cultural celebration, establishing a cornerstone annual tradition",
      "Created systematic documentation processes that improved organizational continuity and institutional memory"
    ],
    hasPhoto: false // Set to true when photo is available
  },
  {
    name: "Yong Papunggon",
    role: "Event Coordinator",
    yearsServed: "Spring 2024 - Fall 2024",
    major: "Accounting",
    homeCountry: "Thailand",
    //countryFlag: "🇹🇭",
    image: "/assets/officers/Yong.jpg",
    keyContributions: [
      "Pioneered and executed UNT's first-ever Songkran Festival, creating a landmark cultural event that significantly elevated ISAB's campus presence",
      "Developed innovative event planning frameworks that became the template for future large-scale cultural celebrations",
      "Successfully coordinated multiple high-impact events that attracted diverse audiences and strengthened intercultural connections",
      "Established strategic partnerships with campus organizations and local community groups, expanding ISAB's collaborative network"
    ],
    hasPhoto: true // Set to true when photo is available
  },
  {
    name: "Chaehyeon Kim",
    role: "Communication Coordinator",
    yearsServed: "Spring 2024 - Fall 2024",
    major: "Art",
    homeCountry: "South Korea",
    //countryFlag: "🇰🇷",
    image: "/assets/officers/chaehyeon.jpg",
    keyContributions: [
      "Spearheaded ISAB's digital presence strategy, establishing the organization's foundational social media framework",
      "Designed and produced the inaugural officer introduction posts, creating the visual identity template for future leadership announcements",
      "Developed content creation standards and brand guidelines that elevated ISAB's professional image across all digital platforms",
      "Implemented strategic communication initiatives that significantly increased student engagement and organizational visibility during ISAB's critical growth phase"
    ],
    hasPhoto: true // Set to true when photo is available
  }
];

// Event galleries with multiple images per event
const eventGalleries = [
  {
    id: 'songkran-2024',
    title: 'Songkran Festival 2024',
    date: 'April 2024',
    description: 'UNT\'s first-ever Songkran Festival celebration organized by Yong Papunggon',
    coverImage: '/assets/gallery/songkran/cover.jpg',
    totalImages: 15,
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
    id: 'rhythms-world-2024',
    title: 'Rhythms of the World 2024',
    date: 'March 2024',
    description: 'Inaugural cultural celebration showcasing global traditions',
    coverImage: '/assets/gallery/rhythms/cover.jpg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/rhythms/1.jpg', caption: 'Opening ceremony with international flags' },
      { url: '/assets/gallery/rhythms/2.jpg', caption: 'Traditional dance performances' },
      { url: '/assets/gallery/rhythms/3.jpg', caption: 'Cultural food showcase' },
      { url: '/assets/gallery/rhythms/4.jpg', caption: 'Students in traditional attire' },
      { url: '/assets/gallery/rhythms/5.jpg', caption: 'Interactive cultural booths' }
    ]
  },
  {
    id: 'first-meeting-2024',
    title: 'First General Meeting 2024',
    date: 'February 2024',
    description: 'ISAB\'s inaugural general body meeting setting the foundation',
    coverImage: '/assets/gallery/gallery1.jpeg',
    totalImages: 8,
    images: [
      { url: '/assets/gallery/gallery1.jpeg', caption: 'Kickoff meeting for Spring 2024' },
      { url: '/assets/gallery/meeting/2.jpg', caption: 'Officer introductions' },
      { url: '/assets/gallery/meeting/3.jpg', caption: 'Setting organizational goals' },
      { url: '/assets/gallery/meeting/4.jpg', caption: 'Student engagement and discussion' }
    ]
  },
  {
    id: 'student-panel-2024',
    title: 'International Student Panel 2024',
    date: 'March 2024',
    description: 'Panel discussion featuring diverse international perspectives',
    coverImage: '/assets/gallery/gallery2.jpeg',
    totalImages: 10,
    images: [
      { url: '/assets/gallery/gallery2.jpeg', caption: 'Discussion panel with global perspectives' },
      { url: '/assets/gallery/panel/2.jpg', caption: 'Student panelists sharing experiences' },
      { url: '/assets/gallery/panel/3.jpg', caption: 'Audience Q&A session' },
      { url: '/assets/gallery/panel/4.jpg', caption: 'Networking after the panel' }
    ]
  },
  {
    id: 'cultural-exchange-2024',
    title: 'Cultural Exchange Event 2024',
    date: 'April 2024',
    description: 'Celebrating diversity and fostering connections at UNT',
    coverImage: '/assets/gallery/gallery3.jpeg',
    totalImages: 18,
    images: [
      { url: '/assets/gallery/gallery3.jpeg', caption: 'Celebrating diversity at UNT' },
      { url: '/assets/gallery/exchange/2.jpg', caption: 'Students sharing their cultures' },
      { url: '/assets/gallery/exchange/3.jpg', caption: 'Traditional games and activities' },
      { url: '/assets/gallery/exchange/4.jpg', caption: 'Cultural presentations' },
      { url: '/assets/gallery/exchange/5.jpg', caption: 'International food tasting' }
    ]
  }
];

// Get events for a specific date
const getEventsForDate = (date: Date) => {
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
                the university administration. Established in December 2023, ISAB started as a small 
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
                  { title: "Growth & Impact", desc: "Under its current leadership, ISAB has more than tripled in size, becoming a vital part of campus life." },
                  { title: "Policy Advocacy", desc: "ISAB has successfully influenced university policies to better support international students." },
                  { title: "Events & Community Building", desc: "Organized cultural events, networking opportunities, and support programs to help international students integrate and succeed." },
                  { title: "Support System", desc: "Established mentorship programs and resource-sharing initiatives to assist new students in adapting to life in the U.S." }
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

        {/* Legacy of Leadership Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground flex items-center">
            <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
            Legacy of Leadership
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            Honoring the founding members and past leaders who established ISAB&apos;s foundation and legacy
          </p>

          <div className="space-y-8">
            {pastOfficers.map((officer, index) => (
              <Card key={index} className="shadow-card-hover border-border bg-card hover:shadow-card-elevated transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* FIXED Photo section */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-full border-2 border-primary/20 overflow-hidden">
                        {officer.hasPhoto && officer.image ? (
                          <Image
                            src={officer.image}
                            alt={`${officer.name} - ${officer.role}`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                            <Users className="h-12 w-12 text-primary/60" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Officer Information */}
                    <div className="flex-grow">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{officer.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full font-medium text-sm">
                            {officer.role}
                          </span>
                          <span className="text-muted-foreground font-medium">{officer.yearsServed}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                            <span>{officer.major}</span>
                          </div>
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-primary" />
                            <span>{officer.countryFlag} {officer.homeCountry}</span>
                          </div>
                        </div>
                      </div>

                      {/* Key Contributions */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Key Contributions</h4>
                        <ul className="space-y-2">
                          {officer.keyContributions.map((contribution, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-muted-foreground leading-relaxed">{contribution}</span>
                            </li>
                          ))}
                        </ul>
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

function EventsPage({ date, onDateSelect }: EventsPageProps) {
  const selectedDateEvents = getEventsForDate(date);
  const upcomingEvents = events.filter(event => event.date >= new Date()).slice(0, 3);

  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold mb-12 text-foreground">ISAB Events</h1>
      
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
                        <h3 className="text-xl font-bold mb-3 text-foreground">{event.title}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-2">{event.time}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">Location:</span>
                            <span className="ml-2">{event.location}</span>
                          </div>
                        </div>
                        <p className="mt-4 text-muted-foreground leading-relaxed">{event.description}</p>
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

      <Card className="shadow-card-hover border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-muted-foreground">{event.time}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
        {currentPage === 'events' && <EventsPage date={date} onDateSelect={handleDateSelect} />}
      </div>
    </div>
  );
}