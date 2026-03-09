/**
 * Server-side Google Drive API Configuration
 *
 * IMPORTANT: These environment variables must NOT have the NEXT_PUBLIC prefix
 * to ensure they're only accessible server-side for security.
 */

export const config = {
  googleDrive: {
    apiKey: process.env.GOOGLE_DRIVE_API_KEY ?? '',
    documentsFolder: process.env.DOCUMENTS_FOLDER_ID ?? '',
    officerPhotosFolder: process.env.OFFICER_PHOTOS_FOLDER_ID ?? '',
    eventPhotosFolder: process.env.EVENT_PHOTOS_FOLDER_ID ?? '',
    // Optional — if missing, board photos fall back to local assets
    boardPhotosFolder: process.env.BOARD_PHOTOS_FOLDER_ID ?? '',
  }
};

// Validate config at call time so missing env vars degrade gracefully
export function validateConfig(): void {
  if (!config.googleDrive.apiKey) {
    throw new Error('GOOGLE_DRIVE_API_KEY environment variable is required');
  }
  if (!config.googleDrive.documentsFolder) {
    throw new Error('DOCUMENTS_FOLDER_ID environment variable is required');
  }
  if (!config.googleDrive.officerPhotosFolder) {
    throw new Error('OFFICER_PHOTOS_FOLDER_ID environment variable is required');
  }
  if (!config.googleDrive.eventPhotosFolder) {
    throw new Error('EVENT_PHOTOS_FOLDER_ID environment variable is required');
  }
}

// Helper functions
export const getGoogleDriveImageUrl = (fileId: string): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600-h1600`;
};

export const getFallbackImageUrl = (name: string): string => {
  const firstName = name.split(' ')[0];
  return `/assets/officers/${firstName}.jpg`;
};
