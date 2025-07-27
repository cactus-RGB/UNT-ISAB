"use client"

import { useState, useEffect, useCallback } from 'react';
import { Users, CalendarIcon, BookOpen, LucideIcon } from 'lucide-react';

const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const ISAB_MAIN_FOLDER_ID = process.env.NEXT_PUBLIC_ISAB_DRIVE_FOLDER_ID;

// Import your existing types instead of redefining them
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

  // Helper function to make Google Drive API calls
  const driveApiCall = async (endpoint: string): Promise<unknown> => {
    if (!GOOGLE_DRIVE_API_KEY) {
      throw new Error('Google Drive API key not configured. Please add NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY to your environment variables.');
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

  // Get folder by name
  const getFolderByName = async (parentFolderId: string, folderName: string): Promise<string | null> => {
    try {
      const response = await driveApiCall(
        `files?q='${parentFolderId}'+in+parents+and+name='${folderName}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)`
      ) as { files?: GoogleDriveFile[] };
      return response.files && response.files.length > 0 ? response.files[0].id : null;
    } catch (error) {
      console.warn(`Folder '${folderName}' not found:`, error);
      return null;
    }
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
        return Users; // Default fallback
    }
  };

  // Parse officer data from Google Docs (matches your current structure exactly)
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
        // Set default image path based on name
        const firstName = officer.name.split(' ')[0];
        officer.image = `/assets/officers/${firstName}.jpg`;
        officers.push(officer as Officer);
      }
    }
    
    return officers;
  };

  // Parse important links (matches your current structure)
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

  // Parse site content for about text, hero text, etc.
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
  const loadOfficerPhotos = async (officers: Officer[], photosFolderId: string): Promise<Officer[]> => {
    try {
      const photoFiles = await getFolderContents(photosFolderId);
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
            `https://drive.google.com/uc?id=${photoFile.id}&export=view` : 
            `/assets/officers/${officer.name.split(' ')[0]}.jpg`
        };
      });
    } catch (error) {
      console.error('Error loading officer photos:', error);
      return officers;
    }
  };

  // Load event galleries from Google Drive
  const loadEventGalleries = async (eventPhotosFolderId: string): Promise<EventGallery[]> => {
    try {
      const eventFolders = await getFolderContents(eventPhotosFolderId);
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
  const loadDocuments = async (documentsFolderId: string): Promise<DocumentContent[]> => {
    try {
      const files = await getFolderContents(documentsFolderId);
      const docFiles = files.filter(file => 
        file.mimeType === 'application/vnd.google-apps.document' ||
        file.mimeType === 'text/plain'
      );
      
      const documents: DocumentContent[] = [];
      
      for (const file of docFiles) {
        try {
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
  const loadAllContent = useCallback(async () => {
    if (!ISAB_MAIN_FOLDER_ID) {
      console.warn('ISAB main folder ID not configured. Using fallback data.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Loading ISAB content from Google Drive...');

      // Get folder IDs
      const [
        officerPhotosFolderId,
        eventPhotosFolderId,
        documentsFolderId
      ] = await Promise.all([
        getFolderByName(ISAB_MAIN_FOLDER_ID, 'Officer photos'),
        getFolderByName(ISAB_MAIN_FOLDER_ID, 'Event Photos'),
        getFolderByName(ISAB_MAIN_FOLDER_ID, 'Documents')
      ]);

      if (!documentsFolderId) {
        console.warn('Documents folder not found. Using fallback data.');
        setLoading(false);
        return;
      }

      // Load documents
      const docs = await loadDocuments(documentsFolderId);
      setDocuments(docs);

      // Process each document type
      for (const doc of docs) {
        switch (doc.type) {
          case 'officers':
            let officerData = parseOfficerDocument(doc.content);
            if (officerPhotosFolderId && officerData.length > 0) {
              officerData = await loadOfficerPhotos(officerData, officerPhotosFolderId);
            }
            setOfficers(officerData);
            break;
            
          case 'links':
            const links = parseLinksDocument(doc.content);
            setImportantLinks(links);
            break;
            
          case 'about':
            const aboutData = parseSiteContent(doc.content);
            setSiteContent(prev => ({ ...prev, ...aboutData }));
            break;
        }
      }

      // Load event galleries
      if (eventPhotosFolderId) {
        const galleries = await loadEventGalleries(eventPhotosFolderId);
        setEventGalleries(galleries);
      }

      setLastUpdated(new Date());
      console.log('Successfully loaded ISAB content from Google Drive');

    } catch (err) {
      console.error('Error loading ISAB content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content from Google Drive');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load content once on mount, no automatic refresh
  // Users can manually refresh when needed
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
    
    // Actions
    refresh: loadAllContent,
    
    // Helper functions
    getDocument: (nameOrType: string) => documents.find(doc => 
      doc.name.toLowerCase().includes(nameOrType.toLowerCase()) ||
      doc.type === nameOrType
    )
  };
};