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
const METADATA_CACHE_KEY = 'isab-cms-metadata';

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

interface FolderMetadata {
  folderId: string;
  lastModified: string;
  fileCount: number;
  files: Array<{
    id: string;
    name: string;
    modifiedTime: string;
  }>;
}

interface CachedMetadata {
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
  // Use the direct download URL which works better for public files
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

// Helper function to get a fallback image URL
const getFallbackImageUrl = (name: string): string => {
  const firstName = name.split(' ')[0];
  return `/assets/officers/${firstName}.jpg`;
};

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
  const [changeDetected, setChangeDetected] = useState<string[]>([]);

  // Cache management functions
  const getCachedData = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      return JSON.parse(cached) as CachedData;
    } catch (error) {
      console.error('Error reading cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const getCachedMetadata = (): CachedMetadata | null => {
    try {
      const cached = localStorage.getItem(METADATA_CACHE_KEY);
      if (!cached) return null;
      return JSON.parse(cached) as CachedMetadata;
    } catch (error) {
      console.error('Error reading metadata cache:', error);
      localStorage.removeItem(METADATA_CACHE_KEY);
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

  const setCachedMetadata = (metadata: Omit<CachedMetadata, 'timestamp'>) => {
    try {
      const cacheMetadata: CachedMetadata = {
        ...metadata,
        timestamp: Date.now()
      };
      localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cacheMetadata));
    } catch (error) {
      console.error('Error setting metadata cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(METADATA_CACHE_KEY);
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

  // Get folder metadata (lightweight check for changes)
  const getFolderMetadata = async (folderId: string): Promise<FolderMetadata> => {
    const response = await driveApiCall(
      `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`
    ) as { files?: GoogleDriveFile[] };
    
    const files = response.files || [];
    
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
  };

  // Check if any folders have changed
  const checkForChanges = async (): Promise<{hasChanges: boolean, changedFolders: string[]}> => {
    const cachedMetadata = getCachedMetadata();
    if (!cachedMetadata) {
      console.log('[CMS]: No cached metadata found, will fetch fresh data');
      return { hasChanges: true, changedFolders: ['documents', 'officerPhotos', 'eventPhotos'] };
    }

    const changedFolders: string[] = [];

    try {
      // Check documents folder
      if (DOCUMENTS_FOLDER_ID) {
        const documentsMetadata = await getFolderMetadata(DOCUMENTS_FOLDER_ID);
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
        const photosMetadata = await getFolderMetadata(OFFICER_PHOTOS_FOLDER_ID);
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
        const eventMetadata = await getFolderMetadata(EVENT_PHOTOS_FOLDER_ID);
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

  // Load officer photos from Google Drive with enhanced debugging
  const loadOfficerPhotos = async (officers: Officer[]): Promise<Officer[]> => {
    if (!OFFICER_PHOTOS_FOLDER_ID) {
      console.log('[CMS]: No officer photos folder ID configured');
      return officers;
    }

    try {
      console.log('[CMS]: Loading officer photos from Google Drive...');
      console.log('[CMS]: Officer Photos Folder ID:', OFFICER_PHOTOS_FOLDER_ID);
      
      const photoFiles = await getFolderContents(OFFICER_PHOTOS_FOLDER_ID);
      console.log('[CMS]: Raw photo files from API:', photoFiles);
      
      const imageFiles = photoFiles.filter(file => 
        file.mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
      );
      
      console.log(`[CMS]: Found ${imageFiles.length} image files in officer photos folder`);
      console.log('[CMS]: Image files found:', imageFiles.map(f => ({ 
        name: f.name, 
        id: f.id,
        mimeType: f.mimeType 
      })));
      
      console.log('[CMS]: Officers to match:', officers.map(o => ({
        name: o.name,
        firstName: o.name.split(' ')[0]
      })));
      
      return officers.map((officer, index) => {
        const firstName = officer.name.split(' ')[0].toLowerCase();
        const fullName = officer.name.toLowerCase().replace(/\s+/g, '');
        
        console.log(`[CMS]: ======== Matching Officer ${index + 1}: ${officer.name} ========`);
        console.log(`[CMS]: First name to match: "${firstName}"`);
        console.log(`[CMS]: Full name to match: "${fullName}"`);
        
        // Try multiple matching strategies
        const photoFile = imageFiles.find((file, fileIndex) => {
          const fileName = file.name.toLowerCase();
          const fileNameNoExt = fileName.replace(/\.[^/.]+$/, '');
          
          const matches = {
            exactFirstName: fileNameNoExt === firstName,
            startsWithFirstName: fileNameNoExt.startsWith(firstName),
            containsFirstName: fileName.includes(firstName),
            exactFullName: fileNameNoExt === fullName,
            containsFullName: fileName.includes(fullName)
          };
          
          console.log(`[CMS]:   File ${fileIndex + 1}: "${file.name}"`);
          console.log(`[CMS]:     fileName: "${fileName}"`);
          console.log(`[CMS]:     fileNameNoExt: "${fileNameNoExt}"`);
          console.log(`[CMS]:     matches:`, matches);
          
          const isMatch = matches.exactFirstName || matches.startsWithFirstName || 
                         matches.containsFirstName || matches.exactFullName || 
                         matches.containsFullName;
          
          if (isMatch) {
            console.log(`[CMS]:     ✅ MATCH FOUND!`);
          }
          
          return isMatch;
        });
        
        if (photoFile) {
          const driveUrl = getGoogleDriveImageUrl(photoFile.id);
          console.log(`[CMS]: ✅ SUCCESS: Found photo for ${officer.name}`);
          console.log(`[CMS]:    Matched file: ${photoFile.name}`);
          console.log(`[CMS]:    Drive URL: ${driveUrl}`);
          console.log(`[CMS]: ========================================`);
          return {
            ...officer,
            image: driveUrl
          };
        } else {
          const fallbackUrl = getFallbackImageUrl(officer.name);
          console.log(`[CMS]: ❌ FAILED: No photo found for ${officer.name}`);
          console.log(`[CMS]:    Using fallback: ${fallbackUrl}`);
          console.log(`[CMS]: ========================================`);
          return {
            ...officer,
            image: fallbackUrl
          };
        }
      });
    } catch (error) {
      console.error('[CMS]: Error loading officer photos:', error);
      
      // Log additional debugging info
      if (error instanceof Error) {
        console.error('[CMS]: Error details:', {
          message: error.message,
          stack: error.stack,
          folderId: OFFICER_PHOTOS_FOLDER_ID,
          apiKey: GOOGLE_DRIVE_API_KEY ? 'Set' : 'Missing'
        });
      }
      
      return officers;
    }
  };

  // Load event galleries from Google Drive with improved error handling
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
            console.log(`[CMS]: Processing event folder: ${folder.name}`);
            const images = await getFolderContents(folder.id);
            const imageFiles = images.filter(file => 
              file.mimeType.startsWith('image/') ||
              /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
            );
            
            if (imageFiles.length === 0) {
              console.log(`[CMS]: No images found in folder: ${folder.name}`);
              continue;
            }
            
            console.log(`[CMS]: Found ${imageFiles.length} images in ${folder.name}`);
            
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
      
      console.log(`[CMS]: Loaded ${galleries.length} event galleries`);
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
      
      console.log(`[CMS]: Found ${docFiles.length} document files`);
      
      const documents: DocumentContent[] = [];
      
      for (const file of docFiles) {
        try {
          console.log(`[CMS]: Processing document: ${file.name}`);
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
      
      console.log(`[CMS]: Successfully processed ${documents.length} documents`);
      return documents;
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  };

  // Load data from cache
  const loadFromCache = (): boolean => {
    const cached = getCachedData();
    if (!cached) return false;

    console.log('[CMS]: Loading from cache');
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
    setLoading(false);
    
    return true;
  };

  // Main content loading function with smart change detection
  const loadAllContent = useCallback(async (forceRefresh: boolean = false) => {
    if (!GOOGLE_DRIVE_API_KEY) {
      const msg = 'Google Drive API key not configured. Using fallback data.';
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // If not forcing refresh, try cache first
      if (!forceRefresh && loadFromCache()) {
        // Still check for changes in background, but don't block UI
        checkForChanges().then(({ hasChanges, changedFolders }) => {
          if (hasChanges) {
            setChangeDetected(changedFolders);
            console.log(`[CMS]: Changes detected in: ${changedFolders.join(', ')}`);
          }
        }).catch(console.error);
        return;
      }

      // Check for changes (or force refresh)
      const { hasChanges, changedFolders } = forceRefresh ? 
        { hasChanges: true, changedFolders: ['documents', 'officerPhotos', 'eventPhotos'] } :
        await checkForChanges();

      if (!hasChanges) {
        console.log('[CMS]: No changes detected, using cached data');
        loadFromCache();
        return;
      }

      console.log(`[CMS]: Changes detected in: ${changedFolders.join(', ')}, fetching fresh data...`);
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

      // Update metadata cache
      const [documentsMetadata, officerPhotosMetadata, eventPhotosMetadata] = await Promise.all([
        DOCUMENTS_FOLDER_ID ? getFolderMetadata(DOCUMENTS_FOLDER_ID) : Promise.resolve({} as FolderMetadata),
        OFFICER_PHOTOS_FOLDER_ID ? getFolderMetadata(OFFICER_PHOTOS_FOLDER_ID) : Promise.resolve({} as FolderMetadata),
        EVENT_PHOTOS_FOLDER_ID ? getFolderMetadata(EVENT_PHOTOS_FOLDER_ID) : Promise.resolve({} as FolderMetadata)
      ]);

      setCachedMetadata({
        documents: documentsMetadata,
        officerPhotos: officerPhotosMetadata,
        eventPhotos: eventPhotosMetadata
      });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    changeDetected,
    
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