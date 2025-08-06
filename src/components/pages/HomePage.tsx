"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ExternalLink, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useGoogleDriveCMS } from '@/hooks/useGoogleDriveCMS';
import OfficerCard from '@/components/officers/OfficerCard';
import OfficerModal from '@/components/officers/OfficerModal';
import type { Officer } from '@/hooks/useGoogleDriveCMS';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const { 
    officers, 
    importantLinks, 
    siteContent,
    loading, 
    error
  } = useGoogleDriveCMS();
  
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse URL parameters on mount to handle direct links to officer modals
  useEffect(() => {
    const parseUrlAndSetState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const officerParam = urlParams.get('officer');
      
      if (officerParam && officers.length > 0) {
        const foundOfficer = officers.find(officer => 
          officer.name === officerParam
        );
        
        if (foundOfficer) {
          setSelectedOfficer(foundOfficer);
          setIsModalOpen(true);
        }
      }
    };

    // Parse URL when officers are loaded
    if (officers.length > 0) {
      parseUrlAndSetState();
    }

    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.modal === 'officer') {
          // Modal state handled by modal component
          return;
        }
      } else {
        // No state means we're back to the main home view
        setSelectedOfficer(null);
        setIsModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [officers]);

  const openOfficerModal = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
    
    // Browser history is handled by the modal component
  };

  const closeOfficerModal = () => {
    setIsModalOpen(false);
    setSelectedOfficer(null);
    
    // Remove officer from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('officer');
    const newUrl = url.pathname + (url.hash || '');
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <>
      <header className="bg-primary-gradient text-primary-foreground py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-6xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              {siteContent.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
              {siteContent.heroSubtitle}
            </p>
            <Button 
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-50 hover:text-green-800 shadow-lg border-2 border-green-600 font-semibold w-full sm:w-auto"
              onClick={() => onPageChange('history')}
            >
              Learn More <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16 md:py-20 container mx-auto px-4 sm:px-6 w-full">
        {/* Loading/Error States - Simplified */}
        {loading && (
          <Card className="mb-12 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <p className="font-medium text-primary">Loading content...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-12 border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Content Load Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <p className="text-sm text-muted-foreground mt-1">Using fallback data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-12 sm:mb-16 shadow-card-hover border-border bg-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center text-foreground">
              <BookOpen className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> About ISAB
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {siteContent.aboutText}
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
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading officers...</p>
            </div>
          ) : officers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {officers.map((officer, index) => (
                <OfficerCard
                  key={index}
                  officer={officer}
                  onClick={openOfficerModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No officers found.</p>
            </div>
          )}
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 flex items-center text-foreground">
            <ExternalLink className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> Important Links
          </h2>
          {importantLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {importantLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <Card key={index} className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card hover:-translate-y-2">
                    <CardContent className="p-6 sm:p-8">
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
                          } else {
                            window.open(link.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        Visit <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExternalLink className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No links found.</p>
            </div>
          )}
        </div>
      </section>

      <OfficerModal 
        officer={selectedOfficer}
        isOpen={isModalOpen}
        onClose={closeOfficerModal}
      />
    </>
  );
}