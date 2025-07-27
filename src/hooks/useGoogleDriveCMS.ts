"use client"

import { useState, useEffect, useCallback } from 'react';
import { Users, CalendarIcon, BookOpen, LucideIcon } from 'lucide-react';

// Use your specific folder IDs
const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const DOCUMENTS_FOLDER_ID = process.env.NEXT_PUBLIC_DOCUMENTS_FOLDER_ID;
const OFFICER_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_OFFICER_PHOTOS_FOLDER_ID;
const EVENT_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_EVENT_PHOTOS_FOLDER_ID;

// Cache configuration
const CACHE_KEY = 'isab-cms-data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

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

interface CachedData {
  officers: Officer[];
  importantLinks: ImportantLink[];
  eventGalleries: EventGallery[];
  siteContent: SiteContent;
  documents: DocumentContent[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Cache management functions
  const getCachedData = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached) as CachedData;
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const setCachedData = (data: Omit<CachedData, 'timestamp'>) => {
    try {
      const cacheData: CachedData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  // Load data from cache
  const loadFromCache = (): boolean => {
    const cached = getCachedData();
    if (!cached) return false;

    console.log('[CMS]: Loading from cache');
    setOfficers(cached.officers);
    setImportantLinks(cached.importantLinks.map(link => ({
      ...link,
      icon: getIconComponent(link.icon.name || 'users') // Reconstruct icon
    })));
    setEventGalleries(cached.eventGalleries);
    setSiteContent(cached.siteContent);
    setDocuments(cached.documents);
    setLastUpdated(new Date(cached.timestamp));
    setIsFromCache(true);
    setLoading(false);
    
    return true;
  };

  // Helper function to make Google Drive API calls
  const driveApiCall = async (endpoint: string): Promise<unknown> => {
    if (!GOOGLE_DRIVE_API_KEY) {
      throw new Error('Google Drive API key not configured.');
    }

    const url = `https://www.googleapis.com/drive/v3/${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${GOOGLE_DRIVE_API_KEY}`;
    
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
  };

  // Get folder contents
  const getFolderContents = async (folderId: string): Promise<GoogleDriveFile[]> => {
    const response = await driveApiCall(
      `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,parents,webViewLink,webContentLink,thumbnailLink,modifiedTime,size)&orderBy=name`
    ) as { files?: GoogleDriveFile[] };
    
    return response.files || [];
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

  // Parse officer data from Google Docs
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
        const firstName = officer.name.split(' ')[0];
        officer.image = `/assets/officers/${firstName}.jpg`;
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
      return officers;
    }

    try {
      const photoFiles = await getFolderContents(OFFICER_PHOTOS_FOLDER_ID);
      const imageFiles = photoFiles.filter(file => 
        file.mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
      );
      
      return officers.map(officer => {
        const firstName = officer.name.split(' ')[0].toLowerCase();
        const photoFile = imageFiles.find(file => {
          const fileName = file.name.toLowerCase();
          return fileName.includes(firstName) || fileName.startsWith(firstName);
        });
        
        return {
          ...officer,
          image: photoFile ? 
            `https://drive.google.com/uc?export=view&id=${photoFile.id}` : 
            `/assets/officers/${officer.name.split(' ')[0]}.jpg`
        };
      });
    } catch (error) {
      console.error('Error loading officer photos:', error);
      return officers;
    }
  };

  // Load event galleries from Google Drive
  const loadEventGalleries = async (): Promise<EventGallery[]> => {
    if (!EVENT_PHOTOS_FOLDER_ID) {
      return [];
    }

    try {
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
            
            if (imageFiles.length === 0) continue;
            
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
              coverImage: `https://drive.google.com/uc?export=view&id=${imageFiles[0].id}`,
              totalImages: imageFiles.length,
              images: imageFiles.map(img => ({
                url: `https://drive.google.com/uc?export=view&id=${img.id}`,
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
      return [];
    }

    try {
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

  // Main content loading function
  const loadAllContent = useCallback(async (forceRefresh: boolean = false) => {
    // Try to load from cache first (unless force refresh)
    if (!forceRefresh && loadFromCache()) {
      return;
    }

    if (!GOOGLE_DRIVE_API_KEY) {
      const msg = 'Google Drive API key not configured. Using fallback data.';
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setIsFromCache(false);
      console.log('[CMS]: Loading fresh data from Google Drive...');

      // Load documents first
      const docs = await loadDocuments();
      setDocuments(docs);

      let newOfficers: Officer[] = [];
      let newLinks: ImportantLink[] = [];
      let newSiteContent = { ...siteContent };

      // Process each document type
      for (const doc of docs) {
        switch (doc.type) {
          case 'officers':
            let officerData = parseOfficerDocument(doc.content);
            officerData = await loadOfficerPhotos(officerData);
            newOfficers = officerData;
            setOfficers(officerData);
            break;
            
          case 'links':
            const links = parseLinksDocument(doc.content);
            newLinks = links;
            setImportantLinks(links);
            break;
            
          case 'about':
            const aboutData = parseSiteContent(doc.content);
            newSiteContent = { ...newSiteContent, ...aboutData };
            setSiteContent(newSiteContent);
            break;
        }
      }

      // Load event galleries
      const galleries = await loadEventGalleries();
      setEventGalleries(galleries);

      // Cache the data
      setCachedData({
        officers: newOfficers,
        importantLinks: newLinks,
        eventGalleries: galleries,
        siteContent: newSiteContent,
        documents: docs
      });

      setLastUpdated(new Date());
      console.log('[CMS]: Fresh data loaded and cached');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load content from Google Drive';
      console.error('Error loading ISAB content:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    setLoading(true);
    loadAllContent(true);
  }, [loadAllContent]);

  // Load content once on mount
  useEffect(() => {
    loadAllContent(false);
  }, [loadAllContent]);

  return {
    // Data
    officers,
    importantLinks,
    eventGalleries,
    siteContent,
    documents,
    
    // For history page
    masterOfficerProfiles,
    semesterBoards,
    
    // State
    loading,
    error,
    lastUpdated,
    isFromCache,
    
    // Actions
    refresh: forceRefresh,
    clearCache,
    
    // Helper functions
    getDocument: (nameOrType: string) => documents.find(doc => 
      doc.name.toLowerCase().includes(nameOrType.toLowerCase()) ||
      doc.type === nameOrType
    )
  };
};