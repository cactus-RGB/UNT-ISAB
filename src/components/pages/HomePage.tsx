"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { currentOfficers } from '@/data/officers';
import { importantLinks } from '@/data/links';
import OfficerCard from '@/components/officers/OfficerCard';
import OfficerModal from '@/components/officers/OfficerModal';
import type { Officer } from '@/data/officers';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openOfficerModal = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
  };

  const closeOfficerModal = () => {
    setIsModalOpen(false);
    setSelectedOfficer(null);
  };

  return (
    <>
      <header className="bg-primary-gradient text-primary-foreground py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-6xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              International Student Advisory Board
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
              Empowering international students at the University of North Texas
            </p>
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
            {currentOfficers.map((officer, index) => (
              <OfficerCard
                key={index}
                officer={officer}
                onClick={openOfficerModal}
              />
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

      <OfficerModal 
        officer={selectedOfficer}
        isOpen={isModalOpen}
        onClose={closeOfficerModal}
      />
    </>
  );
}