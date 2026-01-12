import { Users, CalendarIcon, BookOpen, LucideIcon } from 'lucide-react';
import { googleDriveClient } from './client';
import { config, getGoogleDriveImageUrl, getFallbackImageUrl } from './config';
import type {
  Officer,
  ImportantLink,
  EventGallery,
  SiteContent,
  DocumentContent,
  CMSData,
} from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    users: Users,
    calendar: CalendarIcon,
    book: BookOpen,
    bookopen: BookOpen,
  };

  const normalized = iconName.toLowerCase().trim();
  return iconMap[normalized] || Users;
};

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse officer data from Google Docs format
 * Format: key: value pairs separated by ---
 */
export function parseOfficerDocument(content: string): Officer[] {
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
}

/**
 * Parse important links from Google Docs format
 */
export function parseLinksDocument(content: string): ImportantLink[] {
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
      // Set default icon if not provided
      if (!link.icon) {
        link.icon = Users;
      }
      links.push(link as ImportantLink);
    }
  }

  return links;
}

/**
 * Parse site content from Google Docs format
 */
export function parseSiteContent(content: string): Partial<SiteContent> {
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
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Load all documents from the documents folder
 */
async function fetchDocuments(): Promise<DocumentContent[]> {
  try {
    console.log('[Fetchers]: Loading documents from Google Drive...');
    const files = await googleDriveClient.listFolderContents(
      config.googleDrive.documentsFolder
    );

    const docFiles = files.filter(
      file =>
        file.mimeType === 'application/vnd.google-apps.document' ||
        file.mimeType === 'text/plain'
    );

    const documents: DocumentContent[] = [];

    // Fetch all documents in parallel
    const documentPromises = docFiles.map(async file => {
      try {
        const content = await googleDriveClient.exportDocument(file.id);

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

        return {
          id: file.id,
          name: file.name,
          content,
          lastModified: file.modifiedTime,
          type,
        };
      } catch (error) {
        console.error(`Failed to load document ${file.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(documentPromises);
    return results.filter((doc): doc is DocumentContent => doc !== null);
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

/**
 * Load officer photos and match them to officers
 */
async function fetchOfficerPhotos(officers: Officer[]): Promise<Officer[]> {
  try {
    console.log('[Fetchers]: Loading officer photos from Google Drive...');

    const photoFiles = await googleDriveClient.listFolderContents(
      config.googleDrive.officerPhotosFolder
    );

    const imageFiles = photoFiles.filter(
      file =>
        file.mimeType.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
    );

    return officers.map(officer => {
      const firstName = officer.name.split(' ')[0].toLowerCase();
      const fullName = officer.name.toLowerCase().replace(/\s+/g, '');

      // Try multiple matching strategies
      const photoFile = imageFiles.find(file => {
        const fileName = file.name.toLowerCase();
        const fileNameNoExt = fileName.replace(/\.[^/.]+$/, '');

        return (
          fileNameNoExt === firstName ||
          fileNameNoExt.startsWith(firstName) ||
          fileName.includes(firstName) ||
          fileNameNoExt === fullName ||
          fileName.includes(fullName)
        );
      });

      if (photoFile) {
        const driveUrl = getGoogleDriveImageUrl(photoFile.id);
        return {
          ...officer,
          image: driveUrl,
        };
      } else {
        const fallbackUrl = getFallbackImageUrl(officer.name);
        return {
          ...officer,
          image: fallbackUrl,
        };
      }
    });
  } catch (error) {
    console.error('[Fetchers]: Error loading officer photos:', error);
    return officers;
  }
}

/**
 * Fetch officers with photos (parallelized)
 */
async function fetchOfficersWithPhotos(
  documents: DocumentContent[]
): Promise<Officer[]> {
  const officerDoc = documents.find(doc => doc.type === 'officers');
  if (!officerDoc) {
    console.log('[Fetchers]: No officers document found');
    return [];
  }

  console.log('[Fetchers]: Processing officers document...');
  let officers = parseOfficerDocument(officerDoc.content);
  console.log(`[Fetchers]: Parsed ${officers.length} officers from document`);

  // Fetch photos in parallel
  officers = await fetchOfficerPhotos(officers);
  return officers;
}

/**
 * Fetch important links
 */
async function fetchImportantLinks(
  documents: DocumentContent[]
): Promise<ImportantLink[]> {
  const linksDoc = documents.find(doc => doc.type === 'links');
  if (!linksDoc) {
    console.log('[Fetchers]: No links document found');
    return [];
  }

  console.log('[Fetchers]: Processing links document...');
  const links = parseLinksDocument(linksDoc.content);
  console.log(`[Fetchers]: Parsed ${links.length} links from document`);
  return links;
}

/**
 * Fetch site content
 */
async function fetchSiteContentData(
  documents: DocumentContent[]
): Promise<SiteContent> {
  const defaultContent: SiteContent = {
    aboutText:
      'The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.',
    missionStatement:
      'Our mission is to serve as the voice for international students at UNT, advocating for their needs and fostering a welcoming community that celebrates diversity.',
    heroTitle: 'International Student Advisory Board',
    heroSubtitle: 'Empowering international students at the University of North Texas',
  };

  const aboutDoc = documents.find(doc => doc.type === 'about');
  if (!aboutDoc) {
    console.log('[Fetchers]: No about document found, using defaults');
    return defaultContent;
  }

  console.log('[Fetchers]: Processing about document...');
  const aboutData = parseSiteContent(aboutDoc.content);
  return { ...defaultContent, ...aboutData };
}

/**
 * Fetch event galleries
 */
async function fetchEventGalleriesData(): Promise<EventGallery[]> {
  try {
    console.log('[Fetchers]: Loading event galleries from Google Drive...');
    const eventFolders = await googleDriveClient.listFolderContents(
      config.googleDrive.eventPhotosFolder
    );

    const galleries: EventGallery[] = [];

    // Fetch all galleries in parallel
    const galleryPromises = eventFolders
      .filter(folder => folder.mimeType === 'application/vnd.google-apps.folder')
      .map(async folder => {
        try {
          const images = await googleDriveClient.listFolderContents(folder.id);
          const imageFiles = images.filter(
            file =>
              file.mimeType.startsWith('image/') ||
              /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)
          );

          if (imageFiles.length === 0) {
            return null;
          }

          const galleryId = folder.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          return {
            id: galleryId,
            title: folder.name,
            date: new Date(folder.modifiedTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            description: `Photos from ${folder.name}`,
            coverImage: getGoogleDriveImageUrl(imageFiles[0].id),
            totalImages: imageFiles.length,
            images: imageFiles.map(img => ({
              url: getGoogleDriveImageUrl(img.id),
              caption: img.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]/g, ' '),
            })),
          };
        } catch (error) {
          console.error(`Error loading gallery ${folder.name}:`, error);
          return null;
        }
      });

    const results = await Promise.all(galleryPromises);
    const validGalleries = results.filter(
      (gallery): gallery is EventGallery => gallery !== null
    );

    return validGalleries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error loading event galleries:', error);
    return [];
  }
}

// ============================================================================
// MAIN FETCH FUNCTION
// ============================================================================

/**
 * Fetch all CMS data from Google Drive
 * This is the main entry point for server-side data fetching
 */
export async function fetchAllCMSData(): Promise<CMSData> {
  console.log('[Fetchers]: Starting to fetch all CMS data...');

  try {
    // Step 1: Fetch documents first (needed for parsing other data)
    const documents = await fetchDocuments().catch(err => {
      console.error('Failed to fetch documents:', err);
      return [];
    });

    // Step 2: Fetch everything else in parallel
    const [officers, importantLinks, eventGalleries, siteContent] =
      await Promise.all([
        fetchOfficersWithPhotos(documents).catch(err => {
          console.error('Failed to fetch officers:', err);
          return [];
        }),
        fetchImportantLinks(documents).catch(err => {
          console.error('Failed to fetch links:', err);
          return [];
        }),
        fetchEventGalleriesData().catch(err => {
          console.error('Failed to fetch galleries:', err);
          return [];
        }),
        fetchSiteContentData(documents).catch(err => {
          console.error('Failed to fetch site content:', err);
          return {
            aboutText:
              'The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.',
            missionStatement:
              'Our mission is to serve as the voice for international students at UNT, advocating for their needs and fostering a welcoming community that celebrates diversity.',
            heroTitle: 'International Student Advisory Board',
            heroSubtitle:
              'Empowering international students at the University of North Texas',
          };
        }),
      ]);

    console.log('[Fetchers]: Successfully fetched all CMS data');
    console.log(`  - Officers: ${officers.length}`);
    console.log(`  - Links: ${importantLinks.length}`);
    console.log(`  - Galleries: ${eventGalleries.length}`);
    console.log(`  - Documents: ${documents.length}`);

    return {
      officers,
      importantLinks,
      eventGalleries,
      siteContent,
      documents,
    };
  } catch (error) {
    console.error('Critical error fetching CMS data:', error);
    // Return empty data rather than failing build
    return {
      officers: [],
      importantLinks: [],
      eventGalleries: [],
      siteContent: {
        aboutText:
          'The International Student Advisory Board (ISAB) at UNT is dedicated to advocating for international students, fostering cultural exchange, and enhancing student life through leadership, support, and community engagement.',
        missionStatement:
          'Our mission is to serve as the voice for international students at UNT, advocating for their needs and fostering a welcoming community that celebrates diversity.',
        heroTitle: 'International Student Advisory Board',
        heroSubtitle:
          'Empowering international students at the University of North Texas',
      },
      documents: [],
    };
  }
}
