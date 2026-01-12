// app/page.tsx
import ISABClientWrapper from '@/components/ISABClientWrapper';
import { fetchAllCMSData } from '@/lib/google-drive/fetchers';

// Enable ISR - Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export default async function ISABWebsite() {
  // Fetch all CMS data at build time
  const cmsData = await fetchAllCMSData();

  // Pass pre-fetched data to client wrapper
  return <ISABClientWrapper cmsData={cmsData} />;
}
