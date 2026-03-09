// ============================================================================
// CORE CMS DATA TYPES
// ============================================================================

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
  icon: string;
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

export interface SiteContent {
  aboutText: string;
  missionStatement: string;
  heroTitle: string;
  heroSubtitle: string;
  /** boardId → Google Drive image URL. Empty when folder not configured. */
  boardPhotos: Record<string, string>;
  /** boardId → description text parsed from History Content doc. */
  boardDescriptions: Record<string, string>;
}

// ============================================================================
// GOOGLE DRIVE API TYPES
// ============================================================================

export interface GoogleDriveFile {
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

export interface DocumentContent {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  type: 'officers' | 'links' | 'about' | 'history' | 'general';
}

// ============================================================================
// AGGREGATED CMS DATA
// ============================================================================

export interface CMSData {
  officers: Officer[];
  importantLinks: ImportantLink[];
  eventGalleries: EventGallery[];
  siteContent: SiteContent;
  documents: DocumentContent[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface FolderMetadata {
  folderId: string;
  lastModified: string;
  fileCount: number;
  files: Array<{
    id: string;
    name: string;
    modifiedTime: string;
  }>;
}
