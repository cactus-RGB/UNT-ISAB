"use client"

import { useState, useEffect, useCallback } from 'react';
import { Users, CalendarIcon, BookOpen, LucideIcon } from 'lucide-react';

// Use your specific folder IDs
const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const DOCUMENTS_FOLDER_ID = process.env.NEXT_PUBLIC_DOCUMENTS_FOLDER_ID;
const OFFICER_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_OFFICER_PHOTOS_FOLDER_ID;
const EVENT_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_EVENT_PHOTOS_FOLDER_ID;

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

// Import types from your existing history file instead of redefining
export type { OfficerProfile, SemesterBoard } from '@/data/history';

// Additional content types for website management
export interface SiteContent {
  aboutText: string;
  missionStatement: string;
  heroTitle: string;
  heroSubtitle: string;
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
  // Start with empty arrays - content will be loaded from Google Drive
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[CMS Debug]: ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Helper function to make Google Drive API calls
  const driveApiCall = async (endpoint: string): Promise<unknown> => {
    if (!GOOGLE_DRIVE_API_KEY) {
      throw new Error('Google Drive API key not configured. Please add NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY to your environment variables.');
    }

    const url = `https://www.googleapis.com/drive/v3/${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${GOOGLE_DRIVE_API_KEY}`;
    
    addDebugLog(`Making API call to: ${url.replace(GOOGLE_DRIVE_API_KEY, '[REDACTED]')}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    addDebugLog(`API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      addDebugLog(`API Error: ${response.status} - ${errorText}`);
      
      if (response.status === 403) {
        throw new Error('Access denied. Please check your API key and folder permissions.');
      } else if (response.status === 404) {
        throw new Error('Folder or file not found. Please check your folder ID.');
      } else {
        throw new Error(`Drive API error: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    addDebugLog(`API Response received successfully`);
    return result;
  };

  // Get folder contents
  const getFolderContents = async (folderId: string): Promise<GoogleDriveFile[]> => {
    addDebugLog(`Getting contents of folder: ${folderId}`);
    const response = await driveApiCall(
      `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,parents,webViewLink,webContentLink,thumbnailLink,modifiedTime,size)&orderBy=name`
    ) as { files?: GoogleDriveFile[] };
    
    const files = response.files || [];
    addDebugLog(`Found ${files.length} files in folder ${folderId}`);
    files.forEach(file => addDebugLog(`  - ${file.name} (${file.mimeType})`));
    
    return files;
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
    
    addDebugLog(`Downloading document ${fileId} as ${mimeType}`);
    
    const response = await fetch(exportUrl);
    
    if (!response.ok) {
      addDebugLog(`Document download failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    addDebugLog(`Document content length: ${content.length} characters`);
    addDebugLog(`Document preview: ${content.substring(0, 100)}...`);
    
    return content;
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
        return Users; // Default fallback
    }
  };

  // Parse officer data from Google Docs (matches your current structure exactly)
  const parseOfficerDocument = (content: string): Officer[] => {
    addDebugLog(`Parsing officer document with ${content.length} characters`);
    const officers: Officer[] = [];
    const sections = content.split(/---+/).filter(section => section.trim());
    
    addDebugLog(`Found ${sections.length} officer sections`);
    
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
        // Set default image path based on name
        const firstName = officer.name.split(' ')[0];
        officer.image = `/assets/officers/${firstName}.jpg`;
        officers.push(officer as Officer);
        addDebugLog(`Parsed officer: ${officer.name} - ${officer.role}`);
      }
    }
    
    addDebugLog(`Successfully parsed ${officers.length} officers`);
    return officers;
  };

  // Parse important links (matches your current structure)
  const parseLinksDocument = (content: string): ImportantLink[] => {
    addDebugLog(`Parsing links document with ${content.length} characters`);
    const links: ImportantLink[] = [];
    const sections = content.split(/---+/).filter(section => section.trim());
    
    addDebugLog(`Found ${sections.length} link sections`);
    
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
        addDebugLog(`Parsed link: ${link.title} - ${link.url}`);
      }
    }
    
    addDebugLog(`Successfully parsed ${links.length} links`);
    return links;
  };

  // Parse site content for about text, hero text, etc.
  const parseSiteContent = (content: string): Partial<SiteContent> => {
    addDebugLog(`Parsing site content with ${content.length} characters`);
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
          addDebugLog(`Found about text: ${value.substring(0, 50)}...`);
          break;
        case 'mission':
        case 'mission statement':
          siteData.missionStatement = value;
          addDebugLog(`Found mission statement: ${value.substring(0, 50)}...`);
          break;
        case 'hero title':
          siteData.heroTitle = value;
          addDebugLog(`Found hero title: ${value}`);
          break;
        case 'hero subtitle':
          siteData.heroSubtitle = value;
          addDebugLog(`Found hero subtitle: ${value}`);
          break;
      }
    }
    
    return siteData;
  };

  // Load officer photos from Google Drive
  const loadOfficerPhotos = async (officers: Officer[]): Promise<Officer[]> => {
    if (!OFFICER_PHOTOS_FOLDER_ID) {
      addDebugLog('No officer photos folder ID configured, using fallback images');
      return officers;
    }

    try {
      addDebugLog(`Loading officer photos from folder ${OFFICER_PHOTOS_FOLDER_ID}`);
      const photoFiles = await getFolderContents(OFFICER_PHOTOS_FOLDER_ID);
      const imageFiles = photoFiles.filter(file => 
        file.mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
      );
      
      addDebugLog(`Found ${imageFiles.length} image files for officers`);
      
      return officers.map(officer => {
        const firstName = officer.name.split(' ')[0].toLowerCase();
        const photoFile = imageFiles.find(file => {
          const fileName = file.name.toLowerCase();
          return fileName.includes(firstName) || fileName.startsWith(firstName);
        });
        
        const imageUrl = photoFile ? 
          `https://drive.google.com/uc?id=${photoFile.id}&export=view` : 
          `/assets/officers/${officer.name.split(' ')[0]}.jpg`;
          
        addDebugLog(`Officer ${officer.name}: ${photoFile ? `Google Drive image (${photoFile.name})` : 'fallback image'}`);
        
        return {
          ...officer,
          image: imageUrl
        };
      });
    } catch (error) {
      addDebugLog(`Error loading officer photos: ${error}`);
      return officers;
    }
  };

  // Load event galleries from Google Drive
  const loadEventGalleries = async (): Promise<EventGallery[]> => {
    if (!EVENT_PHOTOS_FOLDER_ID) {
      addDebugLog('No event photos folder ID configured, skipping galleries');
      return [];
    }

    try {
      addDebugLog(`Loading event galleries from folder ${EVENT_PHOTOS_FOLDER_ID}`);
      const eventFolders = await getFolderContents(EVENT_PHOTOS_FOLDER_ID);
      const galleries: EventGallery[] = [];
      
      for (const folder of eventFolders) {
        if (folder.mimeType === 'application/vnd.google-apps.folder') {
          try {
            addDebugLog(`Processing event folder: ${folder.name}`);
            const images = await getFolderContents(folder.id);
            const imageFiles = images.filter(file => 
              file.mimeType.startsWith('image/') ||
              /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
            );
            
            addDebugLog(`Found ${imageFiles.length} images in ${folder.name}`);
            
            if (imageFiles.length === 0) continue;
            
            // Generate gallery ID from folder name
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
              coverImage: `https://drive.google.com/uc?id=${imageFiles[0].id}&export=view`,
              totalImages: imageFiles.length,
              images: imageFiles.map(img => ({
                url: `https://drive.google.com/uc?id=${img.id}&export=view`,
                caption: img.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
              }))
            });
            
            addDebugLog(`Created gallery: ${folder.name} with ${imageFiles.length} images`);
          } catch (error) {
            addDebugLog(`Error loading gallery ${folder.name}: ${error}`);
          }
        }
      }
      
      addDebugLog(`Successfully loaded ${galleries.length} event galleries`);
      return galleries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      addDebugLog(`Error loading event galleries: ${error}`);
      return [];
    }
  };

  // Load documents from Google Drive
  const loadDocuments = async (): Promise<DocumentContent[]> => {
    if (!DOCUMENTS_FOLDER_ID) {
      addDebugLog('No documents folder ID configured');
      return [];
    }

    try {
      addDebugLog(`Loading documents from folder ${DOCUMENTS_FOLDER_ID}`);
      const files = await getFolderContents(DOCUMENTS_FOLDER_ID);
      const docFiles = files.filter(file => 
        file.mimeType === 'application/vnd.google-apps.document' ||
        file.mimeType === 'text/plain'
      );
      
      addDebugLog(`Found ${docFiles.length} document files`);
      
      const documents: DocumentContent[] = [];
      
      for (const file of docFiles) {
        try {
          addDebugLog(`Processing document: ${file.name}`);
          const content = await getDocumentContent(file.id, file.mimeType);
          
          // Detect document type from filename
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
          
          addDebugLog(`Document ${file.name} classified as type: ${type}`);
          
          documents.push({
            id: file.id,
            name: file.name,
            content,
            lastModified: file.modifiedTime,
            type
          });
        } catch (error) {
          addDebugLog(`Failed to load document ${file.name}: ${error}`);
        }
      }
      
      addDebugLog(`Successfully loaded ${documents.length} documents`);
      return documents;
    } catch (error) {
      addDebugLog(`Error loading documents: ${error}`);
      return [];
    }
  };

  // Main content loading function
  const loadAllContent = useCallback(async () => {
    addDebugLog('=== Starting CMS Content Load ===');
    addDebugLog(`Environment check - API Key: ${!!GOOGLE_DRIVE_API_KEY}, Documents: ${!!DOCUMENTS_FOLDER_ID}, Officer Photos: ${!!OFFICER_PHOTOS_FOLDER_ID}, Event Photos: ${!!EVENT_PHOTOS_FOLDER_ID}`);
    
    if (!GOOGLE_DRIVE_API_KEY) {
      const msg = 'Google Drive API key not configured. Using fallback data.';
      addDebugLog(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      addDebugLog('Loading ISAB content from Google Drive...');

      // Load documents first
      const docs = await loadDocuments();
      setDocuments(docs);
      addDebugLog(`Loaded ${docs.length} documents`);

      // Process each document type
      for (const doc of docs) {
        addDebugLog(`Processing document: ${doc.name} (type: ${doc.type})`);
        switch (doc.type) {
          case 'officers':
            let officerData = parseOfficerDocument(doc.content);
            officerData = await loadOfficerPhotos(officerData);
            setOfficers(officerData);
            addDebugLog(`Set ${officerData.length} officers`);
            break;
            
          case 'links':
            const links = parseLinksDocument(doc.content);
            setImportantLinks(links);
            addDebugLog(`Set ${links.length} important links`);
            break;
            
          case 'about':
            const aboutData = parseSiteContent(doc.content);
            setSiteContent(prev => ({ ...prev, ...aboutData }));
            addDebugLog(`Updated site content`);
            break;
        }
      }

      // Load event galleries
      const galleries = await loadEventGalleries();
      setEventGalleries(galleries);
      addDebugLog(`Set ${galleries.length} event galleries`);

      setLastUpdated(new Date());
      addDebugLog('=== CMS Content Load Complete ===');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load content from Google Drive';
      addDebugLog(`=== CMS Content Load Failed: ${errorMsg} ===`);
      console.error('Error loading ISAB content:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load content once on mount, no automatic refresh
  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  return {
    // Data (same structure as your current files)
    officers,
    importantLinks,
    eventGalleries,
    siteContent,
    documents,
    
    // For history page (these would come from additional docs)
    masterOfficerProfiles,
    semesterBoards,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Debug info
    debugInfo,
    
    // Actions
    refresh: loadAllContent,
    
    // Helper functions
    getDocument: (nameOrType: string) => documents.find(doc => 
      doc.name.toLowerCase().includes(nameOrType.toLowerCase()) ||
      doc.type === nameOrType
    )
  };
};