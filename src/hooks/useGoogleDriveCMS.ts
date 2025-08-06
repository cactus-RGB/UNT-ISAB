// Updated hook to handle Yunju's special case as advisor
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Users, CalendarIcon, BookOpen, LucideIcon } from 'lucide-react';

// Use your specific folder IDs
const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const DOCUMENTS_FOLDER_ID = process.env.NEXT_PUBLIC_DOCUMENTS_FOLDER_ID;
const OFFICER_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_OFFICER_PHOTOS_FOLDER_ID;
const EVENT_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_EVENT_PHOTOS_FOLDER_ID;

// Enhanced cache configuration with versioning and ETag support
const CACHE_KEY = 'isab-cms-data-v2';
const METADATA_CACHE_KEY = 'isab-cms-metadata-v2';
const ETAG_CACHE_KEY = 'isab-cms-etag';
const CACHE_VERSION = '2.1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Keep your existing interfaces exactly as they are
export interface Officer {
  name: string;
  role: string;
  year: string;
  image: string;
  major: string;
  homeCountry: string;
  countryFlag: string;
  quote: string;
  // Special field for Yunju (advisor)
  internationalAffairs?: string;
}

export interface ImportantLink {
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
}

export interface EventImage {
  url: string;
  caption: string;
}

export interface EventGallery {
  id: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  totalImages: number;
  images: EventImage[];
}

export type { OfficerProfile, SemesterBoard } from '@/data/history';

export interface SiteContent {
  aboutText: string;
  missionStatement: string;
  heroTitle: string;
  heroSubtitle: string;
}

// Enhanced cache data structure with versioning and ETag
interface EnhancedCachedData {
  version: string;
  timestamp: number;
  etag?: string;
  lastModified?: string;
  officers: Officer[];
  importantLinks: ImportantLink[];
  eventGalleries: EventGallery[];
  siteContent: SiteContent;
  documents: DocumentContent[];
}

interface FolderMetadata {
  folderId: string;
  lastModified: string;
  fileCount: number;
  files: Array<{
    id: string;
    name: string;
    modifiedTime: string;
  }>;
  etag?: string;
}

interface CachedMetadata {
  version: string;
  documents: FolderMetadata;
  officerPhotos: FolderMetadata;
  eventPhotos: FolderMetadata;