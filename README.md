This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

This project requires the following environment variables to be set in Vercel:

### Server-Side (Build Time)
- `GOOGLE_DRIVE_API_KEY` - Google Drive API key for fetching CMS content
- `DOCUMENTS_FOLDER_ID` - Google Drive folder ID for documents
- `OFFICER_PHOTOS_FOLDER_ID` - Google Drive folder ID for officer photos
- `EVENT_PHOTOS_FOLDER_ID` - Google Drive folder ID for event galleries

### Client-Side (Runtime)
- `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY` - Google Calendar API key
- `NEXT_PUBLIC_ISAB_CALENDAR_ID` - ISAB Google Calendar ID

## Deploy on Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the environment variables listed above in Project Settings → Environment Variables
4. Deploy!

The site uses:
- **Static Site Generation (SSG)** with **Incremental Static Regeneration (ISR)**
- Pages rebuild every hour automatically
- Images optimized with Next.js Image (AVIF/WebP)
- Google Drive CMS integration fetched at build time

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
