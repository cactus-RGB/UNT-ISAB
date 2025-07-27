// lib/imageLoader.ts
interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If it's a Google Drive URL, return it as-is without optimization
  if (src.includes('drive.google.com')) {
    return src;
  }
  
  // For local images, use default Next.js optimization
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  // For other external images
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}