"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, ChevronRight, Users, CalendarIcon, BookOpen, Image as ImageIcon, Home } from 'lucide-react';

export default function ISABWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());

  // Now using the actual officer images with .jpeg extension
  const officers = {
    current: [
      { 
        name: "Ibrahim Abubeker", 
        role: "President", 
        year: "2024-25", 
        image: "/assets/officers/ibrahim.jpeg" 
      },
      { 
        name: "Amaris Charles", 
        role: "Vice President", 
        year: "2024-25", 
        image: "/assets/officers/amaris.jpeg" 
      },
      { 
        name: "Iman Mohammed", 
        role: "Secretary", 
        year: "2024-25", 
        image: "/assets/officers/iman.jpeg" 
      },
      { 
        name: "Mohammed Abubeker", 
        role: "Event Coordinator", 
        year: "2024-25", 
        image: "/assets/officers/mohammed.jpeg" 
      },
      { 
        name: "Shiori Hisaoka", 
        role: "Outreach Coordinator", 
        year: "2024-25", 
        image: "/assets/officers/shiori.jpeg" 
      }
    ],
    past: [
      { name: "Past Example", role: "President", year: "2023-24", image: "https://placehold.co/150x150/25b062/ffffff?text=Past" }
    ]
  };

  const importantLinks = [
    { title: "Student Services", url: "https://vpaa.unt.edu/advising/resources/students", description: "Access UNT student resources" },
    { title: "International & Cultural Programs", url: "https://international.unt.edu/content/international-and-cultural-programs-0", description: "Explore international programs at UNT" },
    { title: "International Playlist", url: "https://open.spotify.com/playlist/6cLta1LoXSVpW1WETYR6zJ?si=593410c8fc934c7b", description: "Add your favorite songs from back home!" },
    { title: "Instagram", url: "https://www.instagram.com/untisab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", description: "Follow us on Instagram" }
  ];

  const events = [
    {
      date: new Date(2024, 1, 20),
      title: "General Body Meeting",
      time: "5:00 PM",
      location: "BLB 170",
      description: "Monthly meeting to discuss upcoming events and initiatives"
    },
    {
      date: new Date(2024, 2, 15),
      title: "International Culture Fair",
      time: "3:00 PM",
      location: "Union Courtyard",
      description: "Annual cultural showcase featuring performances and food from around the world"
    },
    {
      date: new Date(2024, 3, 10),
      title: "Professional Development Workshop",
      time: "4:30 PM",
      location: "BLB 080",
      description: "Resume building and networking skills workshop"
    }
  ];

  // Gallery images with actual files
  const galleryImages = [
    { url: "/assets/gallery/gallery1.jpeg", title: "First General Meeting 2024", description: "Kickoff meeting for Spring 2024" },
    { url: "/assets/gallery/gallery2.jpeg", title: "International Student Panel", description: "Discussion panel with global perspectives" },
    { url: "/assets/gallery/gallery3.jpeg", title: "Cultural Exchange Event", description: "Celebrating diversity at UNT" }
  ];

  // Move getEventsForDate to the top level
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const selectedDateEvents = getEventsForDate(date);

  // Handler function for the Calendar component
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  function Navigation() {
    return (
      <nav className="bg-card shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="mr-4">
                {/* Using actual ISAB logo with larger size */}
                <Image
                  src="/assets/logo/ISAB Logo (Cropped).png"
                  alt="ISAB Logo"
                  width={100}  // Increased from 50 to 100
                  height={100} // Increased from 50 to 100
                  className="rounded-md transition-transform hover:scale-105"
                />
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant={currentPage === 'home' ? "default" : "ghost"}
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center transition-all hover:bg-primary/80 active:scale-95"
                >
                  <Home className="mr-2 h-4 w-4" /> Home
                </Button>
                <Button 
                  variant={currentPage === 'history' ? "default" : "ghost"}
                  onClick={() => setCurrentPage('history')}
                  className="flex items-center transition-all hover:bg-primary/80 active:scale-95"
                >
                  <BookOpen className="mr-2 h-4 w-4" /> History
                </Button>
                <Button 
                  variant={currentPage === 'gallery' ? "default" : "ghost"}
                  onClick={() => setCurrentPage('gallery')}
                  className="flex items-center transition-all hover:bg-primary/80 active:scale-95"
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Gallery
                </Button>
                <Button 
                  variant={currentPage === 'events' ? "default" : "ghost"}
                  onClick={() => setCurrentPage('events')}
                  className="flex items-center transition-all hover:bg-primary/80 active:scale-95"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" /> Events
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  function HomePage() {
    return (
      <>
        <header className="bg-primary-gradient text-primary-foreground py-20">
          <div className="container mx-auto px-6">
            <h1 className="text-5xl font-bold mb-4">International Student Advisory Board</h1>
            <p className="text-xl mb-8">University of North Texas</p>
            {/* Learn More button now directs to History page */}
            <Button 
              className="bg-background text-primary hover:bg-muted transition-all hover:scale-105 active:scale-95"
              onClick={() => setCurrentPage('history')}
            >
              Learn More <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="py-16 container mx-auto px-6">
          <Card className="mb-12 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-2" /> About ISAB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, 
                fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.
              </p>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Users className="mr-2" /> Current Officers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {officers.current.map((officer, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow border-primary/20 bg-secondary/40 hover:bg-secondary/60"
                >
                  <CardContent className="p-6">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="rounded-full overflow-hidden w-32 h-32 relative border-2 border-primary">
                        <Image
                          src={officer.image}
                          alt={`${officer.name} - ${officer.role}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center">{officer.name}</h3>
                    <p className="text-muted-foreground text-center">{officer.role}</p>
                    <p className="text-muted-foreground text-sm text-center">{officer.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <ExternalLink className="mr-2" /> Important Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {importantLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{link.title}</h3>
                    <p className="text-muted-foreground mb-4">{link.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full transition-all hover:bg-primary/20 active:scale-95"
                    >
                      Visit <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  function HistoryPage() {
    return (
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Our History</h1>
        <Card className="mb-8 hover:shadow-lg transition-shadow border-primary/20 bg-secondary/40">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Foundation</h2>
            <p className="text-muted-foreground mb-6">
              The International Student Advisory Board (ISAB) at UNT was founded to amplify the voices 
              of international students, ensuring their concerns and needs are heard and addressed by 
              the university administration. Established in December 2023, ISAB started as a small 
              initiative but quickly grew into a recognized student organization. The board was created 
              to foster a welcoming environment for international students, advocating for their interests 
              and enhancing their experience at UNT.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Mission</h2>
            <p className="text-muted-foreground mb-6">
              Our mission is to serve as the voice for international students at UNT, advocating 
              for their needs and fostering a welcoming community that celebrates diversity.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Key Accomplishments</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2"><strong>Growth & Impact:</strong> Under its current leadership, ISAB has more than tripled in size, becoming a vital part of campus life.</li>
              <li className="mb-2"><strong>Policy Advocacy:</strong> ISAB has successfully influenced university policies to better support international students.</li>
              <li className="mb-2"><strong>Events & Community Building:</strong> Organized cultural events, networking opportunities, and support programs to help international students integrate and succeed.</li>
              <li className="mb-2"><strong>Support System:</strong> Established mentorship programs and resource-sharing initiatives to assist new students in adapting to life in the U.S.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  function GalleryPage() {
    return (
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Event Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-primary/20 bg-secondary/40 hover:bg-secondary/60">
              <CardContent className="p-4">
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border-2 border-primary">
                  <div className="w-full h-full relative">
                    <Image
                      src={image.url}
                      alt={image.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                <p className="text-muted-foreground">{image.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function EventsPage() {
    return (
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">ISAB Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-secondary/40">
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-secondary/40">
            <CardHeader>
              <CardTitle>
                Events for {date.toLocaleDateString('en-US', { 
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
                    <Card key={index} className="hover:shadow-md transition-shadow bg-secondary/60">
                      <CardContent className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <div className="text-muted-foreground">
                          <p className="mb-1">
                            <span className="font-medium">Time:</span> {event.time}
                          </p>
                          <p className="mb-1">
                            <span className="font-medium">Location:</span> {event.location}
                          </p>
                          <p className="mt-2">{event.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events scheduled for this date.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'gallery' && <GalleryPage />}
      {currentPage === 'events' && <EventsPage />}
    </div>
  );
}