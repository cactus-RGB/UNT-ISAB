"use client"

import React, { useState } from 'react';
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
    quote: "Keep it moving"
  },
  { 
    name: "Amaris Charles", 
    role: "Vice President", 
    year: "2024-25", 
    image: "/assets/officers/amaris.jpeg",
    major: "Anthropology",
    homeCountry: "Puerto Rico",
    quote: "Something inspiring"
  },
  { 
    name: "Iman Mohammed", 
    role: "Secretary", 
    year: "2024-25", 
    image: "/assets/officers/iman.jpeg",
    major: "Business Analytics",
    homeCountry: "Ethiopia",
    quote: "Winter is coming"
  },
  { 
    name: "Mohammed Abubeker", 
    role: "Event Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/mohammed.jpeg",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    quote: "Football is life"
  },
  { 
    name: "Shiori Hisaoka", 
    role: "Outreach Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/shiori.jpeg",
    major: "Psychology",
    homeCountry: "Japan",
    quote: "Shinzuo Sasageyo"
  }
];

const importantLinks = [
  { title: "Join ISAB", url: "#", description: "Become a member of our organization", icon: Users },
  { title: "UNT Resources", url: "#", description: "Access UNT student resources", icon: BookOpen },
  { title: "Events Calendar", url: "#", description: "Stay updated with our upcoming events", icon: CalendarIcon }
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
    major: "Master&apos;s in Communication",
    homeCountry: "Malaysia",
    keyContributions: [
      "Established the International Student Advisory Board and recruited founding members",
                    "Provided foundational leadership that enabled ISAB&apos;s rapid growth and development",
                    "Created the organizational framework that continues to guide ISAB&apos;s mission today"
    ],
    hasPhoto: false
  },
  {
    name: "Bhavesh Gujula",
    role: "Founding Treasurer",
    yearsServed: "Fall 2023 - Spring 2024", 
    major: "Master&apos;s in Data Analytics",
    homeCountry: "India",
    keyContributions: [
      "Secured initial funding and financial resources essential for ISAB's early operations",
      "Managed fiscal responsibilities for inaugural events that established ISAB's presence on campus",
      "Developed financial protocols and procedures that laid the groundwork for sustainable operations"
    ],
    hasPhoto: false
  }
];

// Gallery images
const galleryImages = [
  { url: "/assets/gallery/gallery1.jpeg", title: "First General Meeting 2024", description: "Kickoff meeting for Spring 2024" },
  { url: "/assets/gallery/gallery2.jpeg", title: "International Student Panel", description: "Discussion panel with global perspectives" },
  { url: "/assets/gallery/gallery3.jpeg", title: "Cultural Exchange Event", description: "Celebrating diversity at UNT" }
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
                width={60}
                height={60}
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
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button 
                variant={currentPage === 'history' ? "default" : "ghost"}
                onClick={() => onPageChange('history')}
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>History</span>
              </Button>
              <Button 
                variant={currentPage === 'gallery' ? "default" : "ghost"}
                onClick={() => onPageChange('gallery')}
                className="flex items-center space-x-2"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Gallery</span>
              </Button>
              <Button 
                variant={currentPage === 'events' ? "default" : "ghost"}
                onClick={() => onPageChange('events')}
                className="flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                <p className="font-medium text-foreground">{officer.homeCountry}</p>
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
  return (
    <>
      <header className="bg-primary-gradient text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">International Student Advisory Board</h1>
            <p className="text-xl mb-8 opacity-90">Empowering international students at the University of North Texas</p>
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 shadow-card-elevated border border-primary/20"
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
          <h2 className="text-4xl font-bold mb-12 flex items-center text-foreground">
            <Users className="mr-3 text-primary" /> Current Officers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officers.map((officer, index) => (
              <Card 
                key={index} 
                className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
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
                  <p className="text-muted-foreground text-sm">{officer.year}</p>
                </CardContent>
              </Card>
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
            Honoring the founding members and past leaders who established ISAB's foundation and legacy
          </p>

          <div className="space-y-8">
            {pastOfficers.map((officer, index) => (
              <Card key={index} className="shadow-card-hover border-border bg-card hover:shadow-card-elevated transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Photo placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-full bg-muted/50 border-2 border-primary/20 flex items-center justify-center">
                        {officer.hasPhoto ? (
                          <div className="w-full h-full rounded-full overflow-hidden">
                            {/* Photo will be added here when available */}
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <Users className="h-12 w-12 text-primary/60" />
                            </div>
                          </div>
                        ) : (
                          <Users className="h-12 w-12 text-primary/60" />
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
                            <span>{officer.homeCountry}</span>
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
  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold mb-12 text-foreground">Event Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleryImages.map((image, index) => (
          <Card key={index} className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={image.url}
                alt={image.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2 text-foreground">{image.title}</h3>
              <p className="text-muted-foreground">{image.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
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