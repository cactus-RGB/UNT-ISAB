import { Users, CalendarIcon, BookOpen } from 'lucide-react';

export interface ImportantLink {
  title: string;
  url: string;
  description: string;
  icon: any;
}

export const importantLinks: ImportantLink[] = [
  { 
    title: "Join ISAB", 
    url: "https://unt.campuslabs.com/engage/organization/untisab", 
    description: "Become a member of our organization", 
    icon: Users 
  },
  { 
    title: "International Affairs Programs", 
    url: "https://international.unt.edu/programs-and-events/index.html", 
    description: "Programs and events for international students", 
    icon: CalendarIcon 
  },
  { 
    title: "UNT Resources", 
    url: "https://studentaffairs.unt.edu/push/unt-resources/index.html", 
    description: "Access UNT student resources", 
    icon: BookOpen
  }
];
