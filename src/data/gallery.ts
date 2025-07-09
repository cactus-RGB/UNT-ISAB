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

export const eventGalleries: EventGallery[] = [
  {
    id: 'inauguration-2024',
    title: 'ISAB Inauguration Ceremony',
    date: 'January 30, 2024',
    description: 'Official inauguration ceremony marking the beginning of ISAB as a recognized student organization',
    coverImage: '/assets/gallery/inauguration/cover.jpg',
    totalImages: 18,
    images: [
      { url: '/assets/gallery/inauguration/1.jpg', caption: 'Official inauguration ceremony' },
      { url: '/assets/gallery/inauguration/2.jpg', caption: 'Founding officers taking oath' },
      { url: '/assets/gallery/inauguration/3.jpg', caption: 'University officials present' },
      { url: '/assets/gallery/inauguration/4.jpg', caption: 'International student community gathering' },
      { url: '/assets/gallery/inauguration/5.jpg', caption: 'Students attentively listening during the welcome speech' },
      { url: '/assets/gallery/inauguration/6.jpg', caption: 'Formal presentation marking the start of the event' },
      { url: '/assets/gallery/inauguration/7.jpg', caption: 'Speaker addressing the audience on stage' },
      { url: '/assets/gallery/inauguration/8.jpg', caption: 'Overview of the room filled with attendees and international flags' },
      { url: '/assets/gallery/inauguration/9.jpg', caption: 'Audience applause after an announcement' },
      { url: '/assets/gallery/inauguration/10.jpg', caption: 'Group photo of the ISAB team with UNT staff and certificate' },
      { url: '/assets/gallery/inauguration/11.jpg', caption: 'Celebratory group photo with the broader international student community' },
      { url: '/assets/gallery/inauguration/12.jpg', caption: 'Keynote speaker delivering remarks under ISAB logo' },
      { url: '/assets/gallery/inauguration/13.jpg', caption: 'Opening speech setting the tone for the ceremony' },
      { url: '/assets/gallery/inauguration/14.jpg', caption: 'Students listening to speeches during the event' },
      { url: '/assets/gallery/inauguration/15.jpg', caption: 'Another angle of the speaker\'s presentation' },
      { url: '/assets/gallery/inauguration/16.jpg', caption: 'Guests paying close attention to the event program' },
      { url: '/assets/gallery/inauguration/17.jpg', caption: 'Students clapping during an award presentation' },
      { url: '/assets/gallery/inauguration/18.jpg', caption: 'Leadership team celebrating with plaque of recognition' }
    ]
  },
  {
    id: 'songkran-2024',
    title: 'Songkran Water Festival',
    date: 'April 17, 2024',
    description: 'UNT\'s first-ever Songkran Festival celebration organized by Yong Pappunggon',
    coverImage: '/assets/gallery/songkran/cover.jpg',
    totalImages: 25,
    images: [
      { url: '/assets/gallery/songkran/1.jpg', caption: 'Traditional water blessing ceremony setup' },
      { url: '/assets/gallery/songkran/2.jpg', caption: 'Students enjoying water activities' },
      { url: '/assets/gallery/songkran/3.jpg', caption: 'Cultural performance during the festival' },
      { url: '/assets/gallery/songkran/4.jpg', caption: 'Traditional Thai decorations' },
      { url: '/assets/gallery/songkran/5.jpg', caption: 'Community gathering and celebration' },
      { url: '/assets/gallery/songkran/6.jpg', caption: 'Students participating in water blessing' }
    ]
  },
  {
    id: 'town-hall-2024',
    title: 'International Student Town Hall',
    date: 'March 26, 2024',
    description: 'Open forum addressing international student concerns and needs',
    coverImage: '/assets/gallery/gallery2.jpeg',
    totalImages: 12,
    images: [
      { url: '/assets/gallery/gallery2.jpeg', caption: 'Town hall discussion panel' },
      { url: '/assets/gallery/townhall/2.jpg', caption: 'Students voicing concerns' },
      { url: '/assets/gallery/townhall/3.jpg', caption: 'University administration listening' },
      { url: '/assets/gallery/townhall/4.jpg', caption: 'Community building session' }
    ]
  },
  {
    id: 'rhythms-world-2024',
    title: 'Rhythms of the World',
    date: 'November 14, 2024',
    description: 'Cultural celebration showcasing global traditions, co-organized by Laura DeCesero',
    coverImage: '/assets/gallery/rhythms/cover.jpg',
    totalImages: 22,
    images: [
      { url: '/assets/gallery/rhythms/1.jpg', caption: 'Opening ceremony with international flags' },
      { url: '/assets/gallery/rhythms/2.jpg', caption: 'Traditional dance performances' },
      { url: '/assets/gallery/rhythms/3.jpg', caption: 'Cultural food showcase' },
      { url: '/assets/gallery/rhythms/4.jpg', caption: 'Students in traditional attire' },
      { url: '/assets/gallery/rhythms/5.jpg', caption: 'Interactive cultural booths' }
    ]
  },
  {
    id: 'game-night-2-2025',
    title: 'International Game Night 2',
    date: 'March 5, 2025',
    description: 'Second iteration of popular international game night bringing cultures together',
    coverImage: '/assets/gallery/gallery3.jpeg',
    totalImages: 14,
    images: [
      { url: '/assets/gallery/gallery3.jpeg', caption: 'Students playing traditional games' },
      { url: '/assets/gallery/gamenight2/2.jpg', caption: 'Board games from different countries' },
      { url: '/assets/gallery/gamenight2/3.jpg', caption: 'Cultural game demonstrations' },
      { url: '/assets/gallery/gamenight2/4.jpg', caption: 'Friendly competition and laughter' }
    ]
  }
];