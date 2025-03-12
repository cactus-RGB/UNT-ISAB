"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, ChevronRight, Users, CalendarIcon, BookOpen, Image, Home } from 'lucide-react';

export default function ISABWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState(new Date());

  const officers = {
    current: [
      { name: "Example Name", role: "President", year: "2024-25", image: "/api/placeholder/150/150" },
      { name: "Example Name", role: "Vice President", year: "2024-25", image: "/api/placeholder/150/150" },
      { name: "Example Name", role: "Secretary", year: "2024-25", image: "/api/placeholder/150/150" }
    ],
    past: [
      { name: "Past Example", role: "President", year: "2023-24", image: "/api/placeholder/150/150" }
    ]
  };

  const importantLinks = [
    { title: "Join ISAB", url: "#", description: "Become a member of our organization" },
    { title: "UNT Resources", url: "#", description: "Access UNT student resources" },
    { title: "Events Calendar", url: "#", description: "Stay updated with our upcoming events" }
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

  const galleryImages = [
    { url: "/api/placeholder/400/300", title: "First General Meeting 2024", description: "Kickoff meeting for Spring 2024" },
    { url: "/api/placeholder/400/300", title: "International Student Panel", description: "Discussion panel with global perspectives" },
    { url: "/api/placeholder/400/300", title: "Cultural Exchange Event", description: "Celebrating diversity at UNT" }
  ];

  function Navigation() {
    return (
      <nav className="bg-card shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button 
                variant={currentPage === 'home' ? "default" : "ghost"}
                onClick={() => setCurrentPage('home')}
                className="flex items-center"
              >
                <Home className="mr-2 h-4 w-4" /> Home
              </Button>
              <Button 
                variant={currentPage === 'history' ? "default" : "ghost"}
                onClick={() => setCurrentPage('history')}
                className="flex items-center"
              >
                <BookOpen className="mr-2 h-4 w-4" /> History
              </Button>
              <Button 
                variant={currentPage === 'gallery' ? "default" : "ghost"}
                onClick={() => setCurrentPage('gallery')}
                className="flex items-center"
              >
                <Image className="mr-2 h-4 w-4" /> Gallery
              </Button>
              <Button 
                variant={currentPage === 'events' ? "default" : "ghost"}
                onClick={() => setCurrentPage('events')}
                className="flex items-center"
              >
                <CalendarIcon className="mr-2 h-4 w-4" /> Events
              </Button>
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
            <Button className="bg-background text-primary hover:bg-muted">
              Learn More <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="py-16 container mx-auto px-6">
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-2" /> About ISAB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                The International Student Advisory Board (ISAB) at UNT serves as a vital bridge 
                between international students and the university community. We focus on fostering 
                cultural exchange, providing support services, and creating opportunities for 
                international students to thrive at UNT.
              </p>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Users className="mr-2" /> Current Officers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {officers.current.map((officer, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <img
                      src={officer.image}
                      alt={officer.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
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
                    <Button variant="outline" className="w-full">
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
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Foundation</h2>
            <p className="text-muted-foreground mb-6">
              The International Student Advisory Board was established in 2024 with the vision of 
              creating a more inclusive and supportive environment for international students at UNT.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Mission</h2>
            <p className="text-muted-foreground mb-6">
              Our mission is to serve as the voice for international students at UNT, advocating 
              for their needs and fostering a welcoming community that celebrates diversity.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Key Achievements</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Established regular cultural exchange programs</li>
              <li className="mb-2">Created peer mentoring system for new international students</li>
              <li className="mb-2">Organized professional development workshops</li>
              <li className="mb-2">Facilitated partnerships with local organizations</li>
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
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
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
    const getEventsForDate = (date) => {
      return events.filter(event => 
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      );
    };

    const selectedDateEvents = getEventsForDate(date);

    return (
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">ISAB Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
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
                    <Card key={index}>
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