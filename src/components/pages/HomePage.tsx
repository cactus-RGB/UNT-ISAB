"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ExternalLink, ChevronRight, CalendarIcon, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
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
    documents, 
    loading, 
    error, 
    lastUpdated, 
    refresh,
    getDocument 
  } = useGoogleDriveCMS();
  
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
              {siteContent.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
              {siteContent.heroSubtitle}
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
        {/* Loading/Error States */}
        {loading && (
          <Card className="mb-12 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium text-primary">Loading content from Google Drive...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment</p>
                </div>
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
                  <h3 className="font-medium text-destructive mb-1">Google Drive Sync Error</h3>
                  <p className="text-sm text-muted-foreground mb-3">{error}</p>
                  <p className="text-sm text-muted-foreground mb-3">Using fallback data.</p>
                  <Button 
                    variant="outline" 
                    onClick={refresh}
                    className="h-8 px-3 py-1 text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lastUpdated && !loading && !error && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Content synced: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={refresh}
              disabled={loading}
              className="h-8 px-3 py-1 text-xs"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        )}

        <Card className="mb-12 sm:mb-16 shadow-card-hover border-border bg-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center text-foreground">
              <BookOpen className="mr-2 sm:mr-3 text-primary h-6 w-6 sm:h-8 sm:w-8" /> About ISAB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {siteContent.aboutText}
            </p>
            {siteContent.missionStatement && (
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                <h3 className="font-semibold text-foreground mb-2">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {siteContent.missionStatement}
                </p>
              </div>
            )}
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
              <p className="text-muted-foreground">Loading officers from Google Drive...</p>
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
              <p className="text-muted-foreground mb-2">No officers found in Google Drive.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a "Current Officers" document in your Documents folder or check your setup.
              </p>
              <Button 
                variant="outline" 
                onClick={refresh}
                className="h-8 px-3 py-1 text-xs"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
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
              <p className="text-muted-foreground mb-2">No links found in Google Drive.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create an "Important Links" document in your Documents folder or check your setup.
              </p>
              <Button 
                variant="outline" 
                onClick={refresh}
                className="h-8 px-3 py-1 text-xs"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          )}
        </div>

        {/* Google Drive Documents Info */}
        {documents.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  Google Drive CMS Active
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Website content is being managed through Google Drive. Found {documents.length} document(s):
              </p>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium"
                  >
                    {doc.name} ({doc.type})
                  </span>
                ))}
              </div>
              <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                Content updates automatically when you modify documents in Google Drive.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup instructions when no Google Drive content is found */}
        {!loading && documents.length === 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800 dark:text-blue-200">
                  Google Drive CMS Not Set Up
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Currently using fallback data. To enable Google Drive content management:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-4">
                <li>• Add NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY to environment variables</li>
                <li>• Add NEXT_PUBLIC_ISAB_DRIVE_FOLDER_ID to environment variables</li>
                <li>• Create "Documents" folder in your ISAB Google Drive folder</li>
                <li>• Add "Current Officers" and "Important Links" documents</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      <OfficerModal 
        officer={selectedOfficer}
        isOpen={isModalOpen}
        onClose={closeOfficerModal}
      />
    </>
  );
}