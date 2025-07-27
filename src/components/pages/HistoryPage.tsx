"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, GraduationCap, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { useGoogleDriveCMS } from '@/hooks/useGoogleDriveCMS';
import { semesterBoards, masterOfficerProfiles } from '@/data/history';
import type { OfficerProfile } from '@/data/history';
import HistoryOfficerModal from '@/components/history/HistoryOfficerModal';

export default function HistoryPage() {
  const { 
    loading, 
    error, 
    lastUpdated, 
    refresh 
  } = useGoogleDriveCMS();

  // Use hardcoded data for now since CMS history integration is not complete
  const currentSemesterBoards = semesterBoards;
  const currentMasterOfficerProfiles = masterOfficerProfiles;

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<(OfficerProfile & { currentRole?: string }) | null>(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);

  const openBoardView = (boardId: string) => {
    setSelectedBoard(boardId);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const closeBoardView = () => {
    setSelectedBoard(null);
  };

  const openOfficerModal = (officerId: string, role: string) => {
    console.log('Opening modal for:', officerId, role);
    const profile = currentMasterOfficerProfiles[officerId];
    if (profile) {
      console.log('Found profile:', profile);
      setSelectedOfficer({ ...profile, currentRole: role });
      setIsOfficerModalOpen(true);
    } else {
      console.log('No profile found for:', officerId);
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

  const currentBoard = selectedBoard ? currentSemesterBoards.find(board => board.id === selectedBoard) : null;

  // Main history view
  if (!selectedBoard) {
    return (
      <div className="w-full">
        <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[40rem] 2xl:h-[48rem] overflow-hidden">
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
              <p className="text-lg sm:text-xl md:text-2xl opacity-90">Celebrating ISAB&apos;s Journey of Growth and Impact</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
          <div className="max-w-4xl mx-auto">
            {/* CMS Status */}
            {error && (
              <Card className="mb-8 border-destructive bg-destructive/5">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive mb-1">History Content Error</h3>
                      <p className="text-sm text-muted-foreground mb-3">{error}</p>
                      <p className="text-sm text-muted-foreground mb-3">Using fallback data.</p>
                      <Button 
                        variant="outline" 
                        onClick={refresh}
                        className="h-8 px-3 py-1 text-xs"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="mb-8 border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-primary">Loading history content from Google Drive...</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                </div>
              </CardContent>
            </Card>

            <div className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-4xl font-bold flex items-center text-foreground">
                  <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
                  Legacy of Leadership
                </h2>
                {lastUpdated && (
                  <Button 
                    variant="outline" 
                    onClick={refresh}
                    disabled={loading}
                    className="h-8 px-3 py-1 text-xs"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mb-12 text-lg">
                Click on any semester board to view the officers who served during that period
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {currentSemesterBoards.map((board, index) => (
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
                      
                      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {board.totalOfficers} officers
                      </div>

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

          <Card className="mb-8 shadow-card-hover border-border bg-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{currentBoard.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBoard.officers.map((officer, index) => {
              const profile = currentMasterOfficerProfiles[officer.id];
              if (!profile) {
                console.log('Missing profile for:', officer.id);
                return null;
              }
              
              return (
                <Card 
                  key={index} 
                  className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card cursor-pointer hover:-translate-y-1"
                  onClick={() => openOfficerModal(officer.id, officer.role)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
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

                      <h3 className="text-lg font-bold text-foreground mb-1">{profile.name}</h3>
                      <div className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full font-medium text-xs mb-2">
                        {officer.role}
                      </div>
                      
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

                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-primary">Click for full bio →</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <HistoryOfficerModal
            officer={selectedOfficer}
            isOpen={isOfficerModalOpen}
            onClose={closeOfficerModal}
          />
        </div>
      </div>
    );
  }

  return null;
}