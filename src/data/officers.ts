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

export const currentOfficers: Officer[] = [
  { 
    name: "Ibrahim Abubeker", 
    role: "President", 
    year: "2024-25", 
    image: "/assets/officers/Ibrahim.jpg",
    major: "Computer Science",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Keep it moving"
  },
  { 
    name: "Amaris Charles", 
    role: "Vice President", 
    year: "2024-25", 
    image: "/assets/officers/Amaris.jpg",
    major: "Anthropology",
    homeCountry: "Puerto Rico",
    countryFlag: "🇵🇷",
    quote: "Something inspiring"
  },
  { 
    name: "Iman Mohammed", 
    role: "Secretary", 
    year: "2024-25", 
    image: "/assets/officers/Iman.jpg",
    major: "Business Analytics",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Winter is coming"
  },
  { 
    name: "Shiori Hisaoka", 
    role: "Outreach Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/Shiori.jpg",
    major: "Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵",
    quote: "Shinzuo Sasageyo"
  },
  { 
    name: "Mohammed Abubeker", 
    role: "Event Coordinator", 
    year: "2024-25", 
    image: "/assets/officers/Mohammed.jpg",
    major: "Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    quote: "Football is life"
  }
];