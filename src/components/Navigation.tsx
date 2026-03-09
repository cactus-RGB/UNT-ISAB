"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Home, BookOpen, Image as ImageIcon, CalendarIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'history', label: 'History', icon: BookOpen },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'events',  label: 'Events',  icon: CalendarIcon },
] as const;

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        className="nav-glass transition-all duration-300"
        style={{
          boxShadow: scrolled
            ? '0 1px 0 rgba(128,128,128,0.08), 0 8px 32px rgba(0,0,0,0.18)'
            : '0 1px 0 rgba(128,128,128,0.04)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-[80px] sm:h-[88px]">

            {/* ── Logo ─────────────────────────────────────────── */}
            <button
              onClick={() => onPageChange('home')}
              className="flex items-center space-x-3 group focus:outline-none"
              aria-label="Go to home"
            >
              <motion.div
                className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Image
                  src="/assets/logo/ISAB Logo (Cropped).PNG"
                  alt="ISAB Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
                  className="rounded-xl"
                  priority
                />
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-foreground leading-tight tracking-tight">ISAB</p>
                <p className="text-[11px] text-muted-foreground leading-tight">University of North Texas</p>
              </div>
            </button>

            {/* ── Desktop: nav pills + theme toggle ────────────── */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Nav pills */}
              <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1">
                {navItems.map(({ id, label, icon: Icon }) => {
                  const active = currentPage === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onPageChange(id)}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      style={{ color: active ? '#fff' : 'var(--muted-foreground)' }}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-lg bg-primary/90"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Theme toggle */}
              <ThemeToggle theme={theme} toggle={toggle} />
            </div>

            {/* ── Mobile: nav pills + theme toggle ─────────────── */}
            <div className="flex sm:hidden items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-muted/40 rounded-xl p-1">
                {navItems.map(({ id, label, icon: Icon }) => {
                  const active = currentPage === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onPageChange(id)}
                      aria-label={label}
                      className="relative flex items-center justify-center w-10 h-9 rounded-lg focus:outline-none"
                      style={{ color: active ? '#fff' : 'var(--muted-foreground)' }}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill-mobile"
                          className="absolute inset-0 rounded-lg bg-primary/90"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon className="relative z-10 h-4 w-4" />
                    </button>
                  );
                })}
              </div>
              <ThemeToggle theme={theme} toggle={toggle} compact />
            </div>

          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/* ── Theme toggle button ─────────────────────────────────────────── */
function ThemeToggle({
  theme, toggle, compact = false,
}: {
  theme: 'dark' | 'light';
  toggle: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center rounded-xl
        bg-muted/40 border border-border/60
        text-muted-foreground hover:text-foreground
        transition-colors duration-200 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-primary/60
        ${compact ? 'w-9 h-9' : 'w-10 h-10'}
      `}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0,   opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.22 }}
        className="absolute"
      >
        {theme === 'dark'
          ? <Sun  className="h-4 w-4" />
          : <Moon className="h-4 w-4" />
        }
      </motion.span>
    </motion.button>
  );
}
