"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, CalendarIcon, ExternalLink, ChevronRight, ArrowRight, type LucideIcon } from 'lucide-react';
import OfficerCard from '@/components/officers/OfficerCard';
import OfficerModal from '@/components/officers/OfficerModal';
import type { Officer, ImportantLink, SiteContent } from '@/lib/google-drive/types';
import {
  fadeUp, staggerContainer, cardEntrance,
  smoothTransition, fastTransition, cardTransition, viewportOnce,
} from '@/lib/motion';

const iconMap: Record<string, LucideIcon> = {
  users:    Users,
  calendar: CalendarIcon,
  book:     BookOpen,
  bookopen: BookOpen,
};

function resolveIcon(name: string): LucideIcon {
  return iconMap[name.toLowerCase()] ?? Users;
}

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
        {children}
      </h2>
    </div>
  );
}

interface HomePageProps {
  officers: Officer[];
  importantLinks: ImportantLink[];
  siteContent: SiteContent;
  onPageChange: (page: string) => void;
}

export default function HomePage({ officers, importantLinks, siteContent, onPageChange }: HomePageProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const parseUrlAndSetState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const officerParam = urlParams.get('officer');
      if (officerParam && officers.length > 0) {
        const found = officers.find(o => o.name === officerParam);
        if (found) { setSelectedOfficer(found); setIsModalOpen(true); }
      }
    };
    if (officers.length > 0) parseUrlAndSetState();

    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.modal) { setSelectedOfficer(null); setIsModalOpen(false); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [officers]);

  const openOfficerModal  = (officer: Officer) => { setSelectedOfficer(officer); setIsModalOpen(true); };
  const closeOfficerModal = () => {
    setIsModalOpen(false);
    setSelectedOfficer(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('officer');
    window.history.replaceState({}, '', url.pathname + (url.hash || ''));
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-primary-gradient" />
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-36 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeUp} transition={fastTransition}>
                <span className="inline-flex items-center gap-2 text-white/70 text-sm font-medium tracking-widest uppercase">
                  <span className="block w-6 h-px bg-white/40" />
                  University of North Texas
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ ...smoothTransition, delay: 0.05 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-white"
              >
                {siteContent.heroTitle}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ ...smoothTransition, delay: 0.1 }}
                className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed"
              >
                {siteContent.heroSubtitle}
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ ...smoothTransition, delay: 0.15 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <button
                  onClick={() => onPageChange('history')}
                  className="group inline-flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ color: '#15803d' }}
                >
                  <span style={{ color: '#15803d' }}>Learn More</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: '#15803d' }} />
                </button>
                <button
                  onClick={() => onPageChange('events')}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  Upcoming Events
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 container mx-auto px-4 sm:px-6 w-full space-y-20 sm:space-y-28">

        {/* About card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={smoothTransition}
        >
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="p-8 sm:p-10 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">About ISAB</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {siteContent.aboutText}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Officers */}
        <div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={smoothTransition}
            className="mb-10"
          >
            <SectionHeading icon={Users}>Current Officers</SectionHeading>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 ml-[52px]">
              Click any card to view their bio, major, home country, and personal quote
            </p>
          </motion.div>

          {officers.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
            >
              {officers.map((officer, index) => (
                <motion.div key={index} variants={cardEntrance} transition={cardTransition}>
                  <OfficerCard officer={officer} onClick={openOfficerModal} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <Users className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No officers found.</p>
            </div>
          )}
        </div>

        {/* Important Links */}
        {importantLinks.length > 0 && (
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={smoothTransition}
              className="mb-10"
            >
              <SectionHeading icon={ExternalLink}>Important Links</SectionHeading>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
            >
              {importantLinks.map((link, index) => {
                const IconComponent = resolveIcon(link.icon);
                return (
                  <motion.div key={index} variants={cardEntrance} transition={cardTransition}>
                    <div className="group relative h-full rounded-2xl border border-border bg-card overflow-hidden card-hover-glow transition-all duration-300 hover:-translate-y-1.5">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="p-7 sm:p-8 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{link.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{link.description}</p>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <button
                            onClick={() => {
                              if (link.url.startsWith('mailto:')) window.location.href = link.url;
                              else window.open(link.url, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200"
                          >
                            Visit
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-200" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

      </section>

      <OfficerModal officer={selectedOfficer} isOpen={isModalOpen} onClose={closeOfficerModal} />
    </>
  );
}
