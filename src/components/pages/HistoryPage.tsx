"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users } from 'lucide-react';
import { semesterBoards, masterOfficerProfiles } from '@/data/history';
import type { OfficerProfile } from '@/data/history';
import HistoryOfficerModal from '@/components/history/HistoryOfficerModal';
import HistoryOfficerCard from '@/components/history/HistoryOfficerCard';
import type { SiteContent } from '@/lib/google-drive/types';
import { fadeUp, staggerContainer, cardEntrance, smoothTransition, cardTransition, viewportOnce } from '@/lib/motion';

interface HistoryPageProps {
  siteContent: SiteContent;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HistoryPage({ siteContent }: HistoryPageProps) {
  const currentSemesterBoards   = semesterBoards;
  const currentMasterOfficerProfiles = masterOfficerProfiles;

  const [selectedBoard, setSelectedBoard]         = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer]     = useState<(OfficerProfile & { currentRole?: string }) | null>(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const headerImages = currentSemesterBoards.map(b => b.coverImage);

  useEffect(() => {
    const parseUrl = () => {
      const p = new URLSearchParams(window.location.search);
      const boardParam   = p.get('board');
      const officerParam = p.get('officer');
      if (boardParam) setSelectedBoard(boardParam);
      if (officerParam) {
        let foundOfficer = null, foundRole = '';
        if (boardParam) {
          const board = currentSemesterBoards.find(b => b.id === boardParam);
          if (board) {
            const o = board.officers.find(o => currentMasterOfficerProfiles[o.id]?.name === officerParam);
            if (o) { foundOfficer = currentMasterOfficerProfiles[o.id]; foundRole = o.role; }
          }
        }
        if (foundOfficer) { setSelectedOfficer({ ...foundOfficer, currentRole: foundRole }); setIsOfficerModalOpen(true); }
      }
    };
    parseUrl();

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.modal === 'history-officer') return;
        if (e.state.board) setSelectedBoard(e.state.board);
        else setSelectedBoard(null);
      } else {
        setSelectedBoard(null); setSelectedOfficer(null); setIsOfficerModalOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentSemesterBoards, currentMasterOfficerProfiles]);

  // Cycle header images
  useEffect(() => {
    if (headerImages.length < 2) return;
    const t = setInterval(() => setCurrentImageIndex(i => (i + 1) % headerImages.length), 3500);
    return () => clearInterval(t);
  }, [headerImages.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOfficerModalOpen) closeOfficerModal();
        else if (selectedBoard) closeBoardView();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOfficerModalOpen, selectedBoard]);

  const openBoardView = (boardId: string) => {
    setSelectedBoard(boardId);
    window.history.pushState({ board: boardId }, '', `${window.location.pathname}#history?board=${encodeURIComponent(boardId)}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const closeBoardView = () => {
    setSelectedBoard(null);
    window.history.pushState({}, '', `${window.location.pathname}#history`);
  };

  const openOfficerModal = (officerId: string, role: string) => {
    const profile = currentMasterOfficerProfiles[officerId];
    if (profile) { setSelectedOfficer({ ...profile, currentRole: role }); setIsOfficerModalOpen(true); }
  };

  const closeOfficerModal = useCallback(() => {
    setIsOfficerModalOpen(false);
    setSelectedOfficer(null);
    const p = new URLSearchParams(window.location.search);
    p.delete('officer');
    const search = p.toString();
    window.history.replaceState(selectedBoard ? { board: selectedBoard } : {}, '', `${window.location.pathname}#history${search ? '?' + search : ''}`);
  }, [selectedBoard]);

  const currentBoard = selectedBoard ? currentSemesterBoards.find(b => b.id === selectedBoard) : null;

  /* ── Main history view ────────────────────────────────────────── */
  if (!selectedBoard) {
    return (
      <div className="w-full">
        {/* Cycling hero */}
        <div className="relative h-[340px] sm:h-[420px] md:h-[520px] lg:h-[620px] xl:h-[700px] overflow-hidden">
          {headerImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <Image
                src={image}
                alt={`ISAB History - ${currentSemesterBoards[index]?.title || 'Board'}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority={index === 0}
              />
            </motion.div>
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            initial="hidden" animate="visible" variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp} transition={{ ...smoothTransition, delay: 0.05 }}
              className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4"
            >
              <span className="inline-flex items-center gap-2"><span className="block w-5 h-px bg-white/40" />Our Story<span className="block w-5 h-px bg-white/40" /></span>
            </motion.p>
            <motion.h1
              variants={fadeUp} transition={{ ...smoothTransition, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg"
            >
              Our Legacy
            </motion.h1>
            <motion.p
              variants={fadeUp} transition={{ ...smoothTransition, delay: 0.15 }}
              className="text-lg sm:text-xl text-white/80 max-w-lg"
            >
              Celebrating ISAB&apos;s Journey of Growth and Impact
            </motion.p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 w-full space-y-16 sm:space-y-24">

          {/* Foundation card */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOnce}
            variants={fadeUp} transition={smoothTransition}
          >
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden max-w-4xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                  Foundation
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                  The International Student Advisory Board (ISAB) at UNT was founded to amplify the voices
                  of international students, ensuring their concerns and needs are heard and addressed by
                  the university administration. Officially inaugurated on January 30, 2024, ISAB started as a small
                  initiative but quickly grew into a recognized student organization. The board was created
                  to foster a welcoming environment for international students, advocating for their interests
                  and enhancing their experience at UNT.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Semester boards */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={viewportOnce}
              variants={fadeUp} transition={smoothTransition}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Legacy of Leadership</h2>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg ml-5">
                Click on any semester board to view the officers who served during that period
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
              initial="hidden" whileInView="visible" viewport={viewportOnce}
              variants={staggerContainer}
            >
              {currentSemesterBoards.map((board, index) => (
                <motion.div
                  key={index}
                  variants={cardEntrance}
                  transition={cardTransition}
                  className="group rounded-2xl border border-border bg-card overflow-hidden cursor-pointer card-hover-glow"
                  whileHover={{ y: -5 }}
                  onClick={() => openBoardView(board.id)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={board.coverImage}
                      alt={board.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/80 px-2.5 py-1 rounded-full text-xs font-medium">
                      {board.totalOfficers} officers
                    </div>
                    <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1.5 text-foreground group-hover:text-primary transition-colors duration-300">{board.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{board.description}</p>
                    <p className="text-xs text-primary font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      View officers <ChevronRight className="h-3 w-3" />
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Board detail view ────────────────────────────────────────── */
  if (currentBoard) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" animate="visible"
            variants={fadeUp} transition={smoothTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center mb-8">
              <Button
                variant="ghost"
                onClick={closeBoardView}
                className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start group"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180 transition-transform group-hover:-translate-x-1" />
                Back to History
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{currentBoard.title}</h1>
                <p className="text-muted-foreground mt-1">{currentBoard.totalOfficers} officers</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10 p-7 rounded-2xl border border-border bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
              <div className="ml-5">
                <h3 className="text-base font-bold text-foreground mb-2">About This Board</h3>
                <p className="text-muted-foreground leading-relaxed">{currentBoard.description}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden" animate="visible"
            variants={staggerContainer}
          >
            {currentBoard.officers.map((officer, index) => {
              const profile = currentMasterOfficerProfiles[officer.id];
              if (!profile) return null;
              return (
                <motion.div key={index} variants={cardEntrance} transition={cardTransition}>
                  <HistoryOfficerCard officer={officer} profile={profile} onClick={openOfficerModal} />
                </motion.div>
              );
            })}
          </motion.div>

          {selectedOfficer && isOfficerModalOpen && (
            <HistoryOfficerModal
              officer={selectedOfficer}
              isOpen={isOfficerModalOpen}
              onClose={closeOfficerModal}
              boardId={selectedBoard || undefined}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
