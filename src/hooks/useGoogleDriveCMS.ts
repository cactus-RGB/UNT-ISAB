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
  timestamp: number;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  modifiedTime: string;
  size?: string;
}

interface DocumentContent {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  type: 'officers' | 'links' | 'about' | 'history' | 'general';
}

// Helper function to get proper Google Drive image URL
const getGoogleDriveImageUrl = (fileId: string): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500-h500`;
};

// Helper function to get a fallback image URL
const getFallbackImageUrl = (name: string): string => {
  const firstName = name.split(' ')[0];
  return `/assets/officers/${firstName}.jpg`;
};

// Enhanced API client with ETag support
class EnhancedDriveAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchWithETag(endpoint: string, etag?: string | null): Promise<{
    data: unknown;
    etag?: string;
    notModified: boolean;
  }> {
    const url = `https://www.googleapis.com/drive/v3/${endpoint}${
      endpoint.includes('?') ? '&' : '?'
    }key=${this.apiKey}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add If-None-Match header for conditional requests
    if (etag && etag.trim()) {
      headers['If-None-Match'] = etag;
    }

    const response = await fetch(url, { headers });

    // Handle 304 Not Modified
    if (response.status === 304) {
      console.log('[CMS]: Server returned 304 Not Modified');
      return { data: null, notModified: true };
    }

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Please check your API key and folder permissions.');
      } else if (response.status === 404) {
        throw new Error('Folder or file not found. Please check your folder ID.');
      } else {
        const errorText = await response.text();
        throw new Error(`Drive API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const responseETag = response.headers.get('ETag');

    return {
      data,
      etag: responseETag || undefined,
      notModified: false
    };
  }

  async regularFetch(endpoint: string): Promise<unknown> {
    const url = `https://www.googleapis.com/drive/v3/${endpoint}${
      endpoint.includes('?') ? '&' : '?'
    }key=${this.apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Please check your API key and folder permissions.');
      } else if (response.status === 404) {
        throw new Error('Folder or file not found. Please check your folder ID.');
      } else {
        const errorText = await response.text();
        throw new Error(`Drive API error: ${response.status} - ${errorText}`);
      }
    }

    return response.json();
  }
}

export const useGoogleDriveCMS = () => {
  // Start with empty arrays - content will be loaded from cache or Google Drive
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>([]);
  const [eventGalleries, setEventGalleries] = useState<EventGallery[]>([]);
  const [masterOfficerProfiles] = useState<{ [key: string]: unknown }>({});
  const [semesterBoards] = useState<unknown[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({
    aboutText: "The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.",
    missionStatement: "Our mission is to serve as the voice for international students at UNT, advocating for their needs and fostering a welcoming community that celebrates diversity.",
    heroTitle: "International Student Advisory Board",
    heroSubtitle: "Empowering international students at the University of North Texas"
  });

  const [documents, setDocuments] = useState<DocumentContent[]>([]);
  
  // Enhanced loading states
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [changeDetected, setChangeDetected] = useState<string[]>([]);
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'cache-hit' | 'fresh' | 'error'>('loading');

  // API client instance
  const apiClient = GOOGLE_DRIVE_API_KEY ? new EnhancedDriveAPIClient(GOOGLE_DRIVE_API_KEY) : null;

  // Enhanced cache management functions
  const getCachedData = (): EnhancedCachedData | null => {
    try {
      if (typeof localStorage === 'undefined') return null;
      
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached) as EnhancedCachedData;
      
      // Check cache version and expiry
      if (data.version !== CACHE_VERSION) {
        console.log('[CMS]: Cache version mismatch, invalidating');
        clearCache();
        return null;
      }

      const now = Date.now();
      const cacheAge = now - data.timestamp;
      
      if (cacheAge > CACHE_EXPIRY_MS) {
        console.log('[CMS]: Cache expired, invalidating');
        clearCache();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      clearCache();
      return null;
    }
  };

  const getCachedMetadata = (): CachedMetadata | null => {
    try {
      if (typeof localStorage === 'undefined') return null;
      
      const cached = localStorage.getItem(METADATA_CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached) as CachedMetadata;
      
      // Check version
      if (data.version !== CACHE_VERSION) {
        console.log('[CMS]: Metadata cache version mismatch, invalidating');
        localStorage.removeItem(METADATA_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading metadata cache:', error);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(METADATA_CACHE_KEY);
      }
      return null;
    }
  };

  const setCachedData = (data: Omit<EnhancedCachedData, 'version' | 'timestamp'>) => {
    try {
      if (typeof localStorage === 'undefined') return;
      
      const cacheData: EnhancedCachedData = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        ...data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const setCachedMetadata = (metadata: Omit<CachedMetadata, 'version' | 'timestamp'>) => {
    try {
      if (typeof localStorage === 'undefined') return;
      
      const cacheMetadata: CachedMetadata = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        ...metadata
      };
      localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cacheMetadata));
    } catch (error) {
      console.error('Error setting metadata cache:', error);
    }
  };

  const clearCache = () => {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(METADATA_CACHE_KEY);
    localStorage.removeItem(ETAG_CACHE_KEY);
  };

  // Helper function to make Google Drive API calls
  const driveApiCall = async (endpoint: string): Promise<unknown> => {
    if (!apiClient) {
      throw new Error('Google Drive API key not configured.');
    }
    return apiClient.regularFetch(endpoint);
  };

  // Get folder metadata (lightweight check for changes) - enhanced with ETag
  const getFolderMetadata = async (folderId: string, useETag: boolean = false): Promise<FolderMetadata> => {
    const endpoint = `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`;
    
    if (useETag && apiClient && typeof localStorage !== 'undefined') {
      const cachedETag = localStorage.getItem(`${ETAG_CACHE_KEY}-${folderId}`);
      const response = await apiClient.fetchWithETag(endpoint, cachedETag);
      
      if (response.notModified) {
        console.log(`[CMS]: Folder ${folderId} not modified (ETag match)`);
        // Return cached metadata
        const cached = getCachedMetadata();
        if (cached && cached.documents.folderId === folderId) {
          return { ...cached.documents, etag: cachedETag || undefined };
        }
      }

      // Save new ETag
      if (response.etag) {
        localStorage.setItem(`${ETAG_CACHE_KEY}-${folderId}`, response.etag);
      }

      const responseData = response.data as { files?: GoogleDriveFile[] } | null;
      const files = responseData?.files || [];
      
      return {
        folderId,
        lastModified: files.length > 0 ? files[0].modifiedTime : '',
        fileCount: files.length,
        files: files.map(f => ({
          id: f.id,
          name: f.name,
          modifiedTime: f.modifiedTime
        })),
        etag: response.etag
      };
    } else {
      // Fallback to regular API call
      const response = await driveApiCall(endpoint);
      const responseData = response as { files?: GoogleDriveFile[] };
      const files = responseData.files || [];
      
      return {
        folderId,
        lastModified: files.length > 0 ? files[0].modifiedTime : '',
        fileCount: files.length,
        files: files.map(f => ({
          id: f.id,
          name: f.name,
          modifiedTime: f.modifiedTime
        }))
      };
    }
  };

  // Enhanced check for changes with ETag support
  const checkForChanges = async (): Promise<{hasChanges: boolean, changedFolders: string[]}> => {
    const cachedMetadata = getCachedMetadata();
    if (!cachedMetadata) {
      console.log('[CMS]: No cached metadata found, will fetch fresh data');
      return { hasChanges: true, changedFolders: ['documents', 'officerPhotos', 'eventPhotos'] };
    }

    const changedFolders: string[] = [];

    try {
      // Check documents folder with ETag
      if (DOCUMENTS_FOLDER_ID) {
        const documentsMetadata = await getFolderMetadata(DOCUMENTS_FOLDER_ID, true);
        if (
          documentsMetadata.lastModified !== cachedMetadata.documents.lastModified ||
          documentsMetadata.fileCount !== cachedMetadata.documents.fileCount
        ) {
          console.log('[CMS]: Changes detected in documents folder');
          changedFolders.push('documents');
        }
      }

      // Check officer photos folder
      if (OFFICER_PHOTOS_FOLDER_ID) {
        const photosMetadata = await getFolderMetadata(OFFICER_PHOTOS_FOLDER_ID, true);
        if (
          photosMetadata.lastModified !== cachedMetadata.officerPhotos.lastModified ||
          photosMetadata.fileCount !== cachedMetadata.officerPhotos.fileCount
        ) {
          console.log('[CMS]: Changes detected in officer photos folder');
          changedFolders.push('officerPhotos');
        }
      }

      // Check event photos folder
      if (EVENT_PHOTOS_FOLDER_ID) {
        const eventMetadata = await getFolderMetadata(EVENT_PHOTOS_FOLDER_ID, true);
        if (
          eventMetadata.lastModified !== cachedMetadata.eventPhotos.lastModified ||
          eventMetadata.fileCount !== cachedMetadata.eventPhotos.fileCount
        ) {
          console.log('[CMS]: Changes detected in event photos folder');
          changedFolders.push('eventPhotos');
        }
      }

      return { hasChanges: changedFolders.length > 0, changedFolders };

    } catch (error) {
      console.error('Error checking for changes:', error);
      // If we can't check for changes, assume there are changes to be safe
      return { hasChanges: true, changedFolders: ['documents', 'officerPhotos', 'eventPhotos'] };
    }
  };

  // Get folder contents (full data)
  const getFolderContents = async (folderId: string): Promise<GoogleDriveFile[]> => {
    const response = await driveApiCall(
      `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,parents,webViewLink,webContentLink,thumbnailLink,modifiedTime,size)&orderBy=name`
    );
    
    const responseData = response as { files?: GoogleDriveFile[] };
    return responseData.files || [];
  };

  // Get document content
  const getDocumentContent = async (fileId: string, mimeType: string): Promise<string> => {
    let exportUrl: string;
    
    if (mimeType === 'application/vnd.google-apps.document') {
      exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${GOOGLE_DRIVE_API_KEY}`;
    } else if (mimeType === 'text/plain') {
      exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    } else {
      throw new Error(`Unsupported document type: ${mimeType}`);
    }
    
    const response = await fetch(exportUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
    }
    
    return response.text();
  };

  // Map icon names to actual Lucide icons
  const getIconComponent = (iconName: string): LucideIcon => {
    switch (iconName.toLowerCase()) {
      case 'users':
        return Users;
      case 'calendar':
      case 'calendaricon':
        return CalendarIcon;
      case 'bookopen':
      case 'book':
        return BookOpen;
      default:
        return Users;
    }
  };

  // Parse officer data from Google Docs - UPDATED to handle Yunju's special fields
  const parseOfficerDocument = (content: string): Officer[] => {
    const officers: Officer[] = [];
    const sections = content.split(/---+/).filter(section => section.trim());
    
    for (const section of sections) {
      const lines = section.split('\n').filter(line => line.trim());
      const officer: Partial<Officer> = {};
      
      for (const line of lines) {
        if (!line.includes(':')) continue;
        
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (!value) continue;
        
        const keyLower = key.toLowerCase().trim();
        
        switch (keyLower) {
          case 'name':
            officer.name = value;
            break;
          case 'role':
            officer.role = value;
            break;
          case 'year':
            officer.year = value;
            break;
          case 'major':
            officer.major = value;
            break;
          case 'international affairs':
          case 'internationalaffairs':
            officer.internationalAffairs = value;
            // For Yunju, set this as the major field for display purposes
            if (!officer.major) {
              officer.major = value;
            }
            break;
          case 'home country':
          case 'country':
            officer.homeCountry = value;
            break;
          case 'country flag':
          case 'flag':
            officer.countryFlag = value;
            break;
          case 'quote':
            officer.quote = value;
            break;
        }
      }
      
      if (officer.name && officer.role) {
        // Set fallback image initially - will be updated if found in Drive
        officer.image = getFallbackImageUrl(officer.name);
        officers.push(officer as Officer);
      }
    }
    
    return officers;
  };

  // Parse important links
  const parseLinksDocument = (content: string): ImportantLink[] => {
    const links: ImportantLink[] = [];
    const sections = content.split(/---+/).filter(section => section.trim());
    
    for (const section of sections) {
      const lines = section.split('\n').filter(line => line.trim());
      const link: Partial<ImportantLink> = {};
      
      for (const line of lines) {
        if (!line.includes(':')) continue;
        
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (!value) continue;
        
        const keyLower = key.toLowerCase().trim();
        
        switch (keyLower) {
          case 'title':
            link.title = value;
            break;
          case 'url':
            link.url = value;
            break;
          case 'description':
            link.description = value;
            break;
          case 'icon':
            link.icon = getIconComponent(value);
            break;
        }
      }
      
      if (link.title && link.url) {
        links.push(link as ImportantLink);
      }
    }
    
    return links;
  };

  // Parse site content
  const parseSiteContent = (content: string): Partial<SiteContent> => {
    const lines = content.split('\n').filter(line => line.trim());
    const siteData: Partial<SiteContent> = {};
    
    for (const line of lines) {
      if (!line.includes(':')) continue;
      
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (!value) continue;
      
      const keyLower = key.toLowerCase().trim();
      
      switch (keyLower) {
        case 'about':
        case 'about text':
          siteData.aboutText = value;
          break;
        case 'mission':
        case 'mission statement':
          siteData.missionStatement = value;
          break;
        case 'hero title':
          siteData.heroTitle = value;
          break;
        case 'hero subtitle':
          siteData.heroSubtitle = value;
          break;
      }
    }
    
    return siteData;
  };

  // Load officer photos from Google Drive
  const loadOfficerPhotos = async (officers: Officer[]): Promise<Officer[]> => {
    if (!OFFICER_PHOTOS_FOLDER_ID) {
      console.log('[CMS]: No officer photos folder ID configured');
      return officers;
    }

    try {
      console.log('[CMS]: Loading officer photos from Google Drive...');
      
      const photoFiles = await getFolderContents(OFFICER_PHOTOS_FOLDER_ID);
      const imageFiles = photoFiles.filter(file => 
        file.mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
      );
      
      return officers.map((officer) => {
        const firstName = officer.name.split(' ')[0].toLowerCase();
        const fullName = officer.name.toLowerCase().replace(/\s+/g, '');
        
        // Try multiple matching strategies
        const photoFile = imageFiles.find((file) => {
          const fileName = file.name.toLowerCase();
          const fileNameNoExt = fileName.replace(/\.[^/.]+$/, '');
          
          return fileNameNoExt === firstName ||
                 fileNameNoExt.startsWith(firstName) ||
                 fileName.includes(firstName) ||
                 fileNameNoExt === fullName ||
                 fileName.includes(fullName);
        });
        
        if (photoFile) {
          const driveUrl = getGoogleDriveImageUrl(photoFile.id);
          return {
            ...officer,
            image: driveUrl
          };
        } else {
          const fallbackUrl = getFallbackImageUrl(officer.name);
          return {
            ...officer,
            image: fallbackUrl
          };
        }
      });
    } catch (error) {
      console.error('[CMS]: Error loading officer photos:', error);
      return officers;
    }
  };

  // Load event galleries from Google Drive
  const loadEventGalleries = async (): Promise<EventGallery[]> => {
    if (!EVENT_PHOTOS_FOLDER_ID) {
      console.log('[CMS]: No event photos folder ID configured');
      return [];
    }

    try {
      console.log('[CMS]: Loading event galleries from Google Drive...');
      const eventFolders = await getFolderContents(EVENT_PHOTOS_FOLDER_ID);
      const galleries: EventGallery[] = [];
      
      for (const folder of eventFolders) {
        if (folder.mimeType === 'application/vnd.google-apps.folder') {
          try {
            const images = await getFolderContents(folder.id);
            const imageFiles = images.filter(file => 
              file.mimeType.startsWith('image/') ||
              /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
            );
            
            if (imageFiles.length === 0) {
              continue;
            }
            
            const galleryId = folder.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            galleries.push({
              id: galleryId,
              title: folder.name,
              date: new Date(folder.modifiedTime).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              description: `Photos from ${folder.name}`,
              coverImage: getGoogleDriveImageUrl(imageFiles[0].id),
              totalImages: imageFiles.length,
              images: imageFiles.map(img => ({
                url: getGoogleDriveImageUrl(img.id),
                caption: img.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
              }))
            });
          } catch (error) {
            console.error(`Error loading gallery ${folder.name}:`, error);
          }
        }
      }
      
      return galleries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error loading event galleries:', error);
      return [];
    }
  };

  // Load documents from Google Drive
  const loadDocuments = async (): Promise<DocumentContent[]> => {
    if (!DOCUMENTS_FOLDER_ID) {
      console.log('[CMS]: No documents folder ID configured');
      return [];
    }

    try {
      console.log('[CMS]: Loading documents from Google Drive...');
      const files = await getFolderContents(DOCUMENTS_FOLDER_ID);
      const docFiles = files.filter(file => 
        file.mimeType === 'application/vnd.google-apps.document' ||
        file.mimeType === 'text/plain'
      );
      
      const documents: DocumentContent[] = [];
      
      for (const file of docFiles) {
        try {
          const content = await getDocumentContent(file.id, file.mimeType);
          
          let type: DocumentContent['type'] = 'general';
          const fileName = file.name.toLowerCase();
          
          if (fileName.includes('officer') || fileName.includes('current')) {
            type = 'officers';
          } else if (fileName.includes('link') || fileName.includes('important')) {
            type = 'links';
          } else if (fileName.includes('about') || fileName.includes('mission')) {
            type = 'about';
          } else if (fileName.includes('history')) {
            type = 'history';
          }
          
          documents.push({
            id: file.id,
            name: file.name,
            content,
            lastModified: file.modifiedTime,
            type
          });
        } catch (error) {
          console.error(`Failed to load document ${file.name}:`, error);
        }
      }
      
      return documents;
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  };

  // Enhanced load data from cache with instant rendering
  const loadFromCache = (): boolean => {
    const cached = getCachedData();
    if (!cached) return false;

    console.log('[CMS]: Loading from cache instantly');
    setOfficers(cached.officers);
    setImportantLinks(cached.importantLinks.map(link => ({
      ...link,
      icon: getIconComponent((link.icon as { name?: string })?.name || 'users')
    })));
    setEventGalleries(cached.eventGalleries);
    setSiteContent(cached.siteContent);
    setDocuments(cached.documents);
    setLastUpdated(new Date(cached.timestamp));
    setIsFromCache(true);
    setInitialLoading(false);
    setLoading(false);
    setCacheStatus('cache-hit');
    
    return true;
  };

  // Enhanced main content loading function with smart change detection and ETag
  const loadAllContent = useCallback(async (forceRefresh: boolean = false) => {
    if (!GOOGLE_DRIVE_API_KEY) {
      const msg = 'Google Drive API key not configured. Using fallback data.';
      setError(msg);
      setInitialLoading(false);
      setLoading(false);
      setCacheStatus('error');
      return;
    }

    try {
      setError(null);

      // Step 1: Try to load from cache first (instant loading for return visits)
      if (!forceRefresh) {
        const cacheLoaded = loadFromCache();
        if (cacheLoaded) {
          // Start background refresh while showing cached content
          setBackgroundRefreshing(true);
          
          // Check for changes in background
          try {
            const { hasChanges, changedFolders } = await checkForChanges();
            if (hasChanges) {
              console.log(`[CMS]: Changes detected in: ${changedFolders.join(', ')}, refreshing in background`);
              setChangeDetected(changedFolders);
              await performFreshDataLoad();
            } else {
              console.log('[CMS]: No changes detected, keeping cached data');
            }
          } catch (backgroundError) {
            console.error('[CMS]: Background refresh failed:', backgroundError);
            // Don't set error state since we have cached data working
          } finally {
            setBackgroundRefreshing(false);
          }
          
          return;
        }
      }

      // Step 2: No cache or forced refresh - fetch fresh data with loading state
      console.log('[CMS]: No cache found or forced refresh, fetching fresh data');
      setInitialLoading(true);
      setLoading(true);
      setCacheStatus('loading');
      
      await performFreshDataLoad();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load content from Google Drive';
      console.error('Error loading ISAB content:', err);
      setError(errorMsg);
      setCacheStatus('error');
    } finally {
      setInitialLoading(false);
      setLoading(false);
      setBackgroundRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate function to perform fresh data loading
  const performFreshDataLoad = async () => {
    console.log('[CMS]: Performing fresh data load...');
    setIsFromCache(false);
    setChangeDetected([]);

    // Load fresh data
    const docs = await loadDocuments();
    setDocuments(docs);

    let newOfficers: Officer[] = [];
    let newLinks: ImportantLink[] = [];
    let newSiteContent = { ...siteContent };

    // Process each document type
    for (const doc of docs) {
      switch (doc.type) {
        case 'officers':
          console.log('[CMS]: Processing officers document...');
          let officerData = parseOfficerDocument(doc.content);
          console.log(`[CMS]: Parsed ${officerData.length} officers from document`);
          officerData = await loadOfficerPhotos(officerData);
          newOfficers = officerData;
          setOfficers(officerData);
          break;
          
        case 'links':
          console.log('[CMS]: Processing links document...');
          const links = parseLinksDocument(doc.content);
          console.log(`[CMS]: Parsed ${links.length} links from document`);
          newLinks = links;
          setImportantLinks(links);
          break;
          
        case 'about':
          console.log('[CMS]: Processing about document...');
          const aboutData = parseSiteContent(doc.content);
          newSiteContent = { ...newSiteContent, ...aboutData };
          setSiteContent(newSiteContent);
          break;
      }
    }

    // Load event galleries
    const galleries = await loadEventGalleries();
    setEventGalleries(galleries);

    // Update metadata cache with ETag information
    try {
      const metadataPromises: Promise<FolderMetadata>[] = [];
      
      if (DOCUMENTS_FOLDER_ID) {
        metadataPromises.push(getFolderMetadata(DOCUMENTS_FOLDER_ID, true));
      } else {
        metadataPromises.push(Promise.resolve({
          folderId: '',
          lastModified: '',
          fileCount: 0,
          files: []
        }));
      }
      
      if (OFFICER_PHOTOS_FOLDER_ID) {
        metadataPromises.push(getFolderMetadata(OFFICER_PHOTOS_FOLDER_ID, true));
      } else {
        metadataPromises.push(Promise.resolve({
          folderId: '',
          lastModified: '',
          fileCount: 0,
          files: []
        }));
      }
      
      if (EVENT_PHOTOS_FOLDER_ID) {
        metadataPromises.push(getFolderMetadata(EVENT_PHOTOS_FOLDER_ID, true));
      } else {
        metadataPromises.push(Promise.resolve({
          folderId: '',
          lastModified: '',
          fileCount: 0,
          files: []
        }));
      }

      const [documentsMetadata, officerPhotosMetadata, eventPhotosMetadata] = await Promise.all(metadataPromises);

      setCachedMetadata({
        documents: documentsMetadata,
        officerPhotos: officerPhotosMetadata,
        eventPhotos: eventPhotosMetadata
      });

      // Cache the fresh data with ETag
      const latestETag = documentsMetadata.etag;
      setCachedData({
        etag: latestETag,
        officers: newOfficers.length > 0 ? newOfficers : officers,
        importantLinks: newLinks.length > 0 ? newLinks : importantLinks,
        eventGalleries: galleries,
        siteContent: newSiteContent,
        documents: docs
      });

      setLastUpdated(new Date());
      setCacheStatus('fresh');
      console.log('[CMS]: Fresh data loaded and cached with ETag support');
    } catch (metadataError) {
      console.error('[CMS]: Error updating metadata cache:', metadataError);
      // Still cache the content data even if metadata fails
      setCachedData({
        officers: newOfficers.length > 0 ? newOfficers : officers,
        importantLinks: newLinks.length > 0 ? newLinks : importantLinks,
        eventGalleries: galleries,
        siteContent: newSiteContent,
        documents: docs
      });
      setLastUpdated(new Date());
      setCacheStatus('fresh');
    }
  };

  // Enhanced force refresh function
  const forceRefresh = useCallback(() => {
    console.log('[CMS]: Force refresh requested');
    setBackgroundRefreshing(!isFromCache); // Show background refresh if we have cached data
    setLoading(!isFromCache); // Show loading only if we don't have cached data
    loadAllContent(true);
  }, [loadAllContent, isFromCache]);

  // Load content once on mount
  useEffect(() => {
    loadAllContent(false);
  }, [loadAllContent]);

  return {
    // Data - keeping your original interface
    officers,
    importantLinks,
    eventGalleries,
    siteContent,
    documents,
    
    // For history page - keeping your original interface
    masterOfficerProfiles,
    semesterBoards,
    
    // Enhanced state management
    loading,                    // Backward compatible - true when loading
    initialLoading,            // True only on first load with no cache
    backgroundRefreshing,      // True when refreshing in background
    error,
    lastUpdated,
    isFromCache,
    changeDetected,
    cacheStatus,              // 'loading' | 'cache-hit' | 'fresh' | 'error'
    
    // Actions - keeping your original interface
    refresh: forceRefresh,
    clearCache,
    
    // Helper functions - keeping your original interface
    getDocument: (nameOrType: string) => documents.find(doc => 
      doc.name.toLowerCase().includes(nameOrType.toLowerCase()) ||
      doc.type === nameOrType
    )
  };
};