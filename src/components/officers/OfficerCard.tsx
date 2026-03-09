"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Officer } from '@/lib/google-drive/types';
import { Users } from 'lucide-react';

interface OfficerCardProps {
  officer: Officer;
  onClick: (officer: Officer) => void;
}

function OfficerImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
        <Users className="h-16 w-16 text-primary/60 mb-2" />
        <p className="text-xs text-primary/60 font-medium">Photo unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => setImageError(true)}
        priority={false}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300" />
    </div>
  );
}

export default function OfficerCard({ officer, onClick }: OfficerCardProps) {
  return (
    <motion.div
      onClick={() => onClick(officer)}
      className="group relative border border-border bg-card rounded-2xl overflow-hidden cursor-pointer w-full"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-primary/30 transition-all duration-300 pointer-events-none z-10" />

      {/* Photo */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <OfficerImage
          src={officer.image}
          alt={`${officer.name} - ${officer.role}`}
        />

        {/* "Click to view bio" hint */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-sm font-medium text-white">View bio</p>
          </div>
        </div>

        {/* Name / role overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3 className="text-xl font-bold text-white drop-shadow-md mb-1.5">{officer.name}</h3>
          <span className="inline-flex items-center bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            {officer.role}
          </span>
          <p className="text-white/75 text-sm mt-1.5 drop-shadow">{officer.year}</p>
        </div>
      </div>
    </motion.div>
  );
}
