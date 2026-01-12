import { config } from './config';
import type { GoogleDriveFile } from './types';

/**
 * Server-side Google Drive API Client
 *
 * This client is designed for build-time data fetching with:
 * - Retry logic with exponential backoff
 * - Proper error handling
 * - Parallel request support
 * - No client-side caching (handled by ISR)
 */
export class GoogleDriveClient {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.googleDrive.apiKey;
  }

  /**
   * Make a GET request to the Google Drive API with retry logic
   */
  private async fetchWithRetry(
    endpoint: string,
    retryCount = 0
  ): Promise<unknown> {
    const url = `${this.baseUrl}/${endpoint}${
      endpoint.includes('?') ? '&' : '?'
    }key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
        // Add caching hints for Next.js
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        // Handle rate limiting with exponential backoff
        if (response.status === 429 && retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          console.log(`[GoogleDriveClient]: Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.fetchWithRetry(endpoint, retryCount + 1);
        }

        // Handle specific errors
        if (response.status === 403) {
          throw new Error(
            'Access denied. Please check your API key and folder permissions.'
          );
        } else if (response.status === 404) {
          throw new Error('Folder or file not found. Please check your folder ID.');
        } else {
          const errorText = await response.text();
          throw new Error(`Drive API error: ${response.status} - ${errorText}`);
        }
      }

      return response.json();
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.maxRetries && error instanceof TypeError) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.log(`[GoogleDriveClient]: Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(endpoint, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * List all files in a folder
   */
  async listFolderContents(folderId: string): Promise<GoogleDriveFile[]> {
    const endpoint = `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,parents,webViewLink,webContentLink,thumbnailLink,modifiedTime,size)&orderBy=name`;

    const response = await this.fetchWithRetry(endpoint);
    const data = response as { files?: GoogleDriveFile[] };
    return data.files || [];
  }

  /**
   * Export a Google Doc as plain text
   */
  async exportDocument(fileId: string): Promise<string> {
    const endpoint = `files/${fileId}/export?mimeType=text/plain`;

    try {
      const response = await this.fetchWithRetry(endpoint);
      return response as string;
    } catch (error) {
      // If export fails, try getting file metadata to check if it's a regular file
      console.warn(`[GoogleDriveClient]: Failed to export document ${fileId}, trying regular download...`);
      return this.downloadFile(fileId);
    }
  }

  /**
   * Download a regular file (non-Google Doc)
   */
  async downloadFile(fileId: string): Promise<string> {
    const endpoint = `files/${fileId}?alt=media`;
    const response = await this.fetchWithRetry(endpoint);
    return response as string;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
    const endpoint = `files/${fileId}?fields=id,name,mimeType,parents,webViewLink,webContentLink,thumbnailLink,modifiedTime,size`;
    const response = await this.fetchWithRetry(endpoint);
    return response as GoogleDriveFile;
  }

  /**
   * Get folder metadata (for change detection)
   */
  async getFolderMetadata(folderId: string): Promise<{
    folderId: string;
    lastModified: string;
    fileCount: number;
    files: Array<{
      id: string;
      name: string;
      modifiedTime: string;
    }>;
  }> {
    const endpoint = `files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`;

    const response = await this.fetchWithRetry(endpoint);
    const data = response as { files?: GoogleDriveFile[] };
    const files = data.files || [];

    return {
      folderId,
      lastModified: files.length > 0 ? files[0].modifiedTime : '',
      fileCount: files.length,
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        modifiedTime: f.modifiedTime,
      })),
    };
  }
}

// Export singleton instance
export const googleDriveClient = new GoogleDriveClient();
