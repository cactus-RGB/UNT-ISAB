"use client"

import React from 'react';
import Image from 'next/image';
import { Officer } from '@/data/officers';

interface OfficerCardProps {
  officer: Officer;
  onClick: (officer: Officer) => void;
}

export default function OfficerCard({ officer, onClick }: OfficerCardProps) {
  return (
    <div
      onClick={() => onClick(officer)}
      className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-primary-gradient hover:-translate-y-2 cursor-pointer rounded-lg overflow-hidden w-full"
    >
      <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 flex-shrink-0">
          <div className="rounded-full overflow-hidden w-full h-full relative transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40">
            <Image
              src={officer.image}
              alt={`${officer.name} - ${officer.role}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
              className="transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight">
            {officer.name}
          </h3>
          <p className="text-white/90 font-medium text-sm sm:text-base mb-1">
            {officer.role}
          </p>
          <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
            {officer.year}
          </p>
        </div>
        
        <div className="mt-2 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs sm:text-sm text-white font-medium">
            Click to view bio →
          </p>
        </div>
      </div>
    </div>
  );
}