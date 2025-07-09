export interface OfficerProfile {
  name: string;
  major: string;
  homeCountry: string;
  countryFlag: string;
  image: string;
  hasPhoto: boolean;
  roles: Array<{ semester: string; period: string; role: string }>;
  overallContributions: string[];
  roleSpecificHighlights: { [key: string]: string[] };
}

export interface SemesterBoard {
  id: string;
  title: string;
  period: string;
  description: string;
  coverImage: string;
  totalOfficers: number;
  officers: Array<{ id: string; role: string }>;
}

export const masterOfficerProfiles: { [key: string]: OfficerProfile } = {
  "adrian-tam": {
    name: "Adrian \"Boss\" Tam",
    major: "M.A. in Communication",
    homeCountry: "Malaysia",
    countryFlag: "🇲🇾",
    image: "/assets/officers/Boss.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding President" },
      { semester: "Spring 2024", period: "Spring 2024", role: "President" }
    ],
    overallContributions: [
      "Founded the International Student Advisory Board and recruited its inaugural members",
      "Provided visionary leadership during ISAB's formative phase, enabling early recognition by university administration", 
      "Developed the core organizational framework and governance structure still in use today",
      "Spearheaded ISAB's first events, establishing credibility and campus presence"
    ],
    roleSpecificHighlights: {
      "Founding President": ["Established ISAB as recognized student organization", "Recruited founding board members"],
      "President": ["Oversaw first major event implementations", "Established university partnerships"]
    }
  },
  "amaris-charles": {
    name: "Amaris Charles",
    major: "B.A. in Anthropology", 
    homeCountry: "Puerto Rico",
    countryFlag: "🇵🇷",
    image: "/assets/officers/Amaris.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Vice President" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Vice President" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Vice President" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Vice President" }
    ],
    overallContributions: [
      "Co-founded ISAB and played a critical role in shaping its mission and operational structure",
      "Provided continuous leadership across multiple boards, helping ensure stability and growth",
      "Developed signature event planning strategies that defined ISAB's programming model",
      "Led inclusive cultural initiatives that increased international student participation and engagement"
    ],
    roleSpecificHighlights: {
      "Founding Vice President": ["Co-established organizational structure", "Developed initial event frameworks"],
      "Vice President": ["Led major cultural celebrations", "Mentored new officer transitions"]
    }
  },
  "ibrahim-abubeker": {
    name: "Ibrahim Abubeker",
    major: "B.S. in Computer Science",
    homeCountry: "Ethiopia", 
    countryFlag: "🇪🇹",
    image: "/assets/officers/Ibrahim.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Secretary" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Secretary" },
      { semester: "Fall 2024", period: "Fall 2024", role: "President" },
      { semester: "Spring 2025", period: "Spring 2025", role: "President" }
    ],
    overallContributions: [
      "Advanced from Founding Secretary to President, demonstrating strong leadership and organizational growth",
      "Maintained institutional memory through detailed record-keeping and documentation",
      "As President, led ISAB's expansion with innovative programs and increased membership",
      "Strengthened ISAB's visibility through university advocacy and technical innovation, including developing the official ISAB website"
    ],
    roleSpecificHighlights: {
      "Founding Secretary": ["Established documentation protocols", "Maintained founding meeting records"],
      "Secretary": ["Streamlined organizational processes", "Improved member communication"],
      "President": ["Expanded event programming", "Increased membership engagement"]
    }
  },
  "bhavesh-gujula": {
    name: "Bhavesh Gujula",
    major: "M.S. in Data Analytics",
    homeCountry: "India",
    countryFlag: "🇮🇳", 
    image: "/assets/officers/Bhavesh.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Founding Board", period: "December 2023", role: "Founding Treasurer" },
      { semester: "Spring 2024", period: "Spring 2024", role: "Treasurer" }
    ],
    overallContributions: [
      "Secured ISAB's initial funding and managed budgeting for its earliest events",
      "Established financial protocols that ensured transparent and sustainable operations", 
      "Designed budget frameworks to support programming scalability",
      "Played a key role in building the infrastructure for long-term financial management"
    ],
    roleSpecificHighlights: {
      "Founding Treasurer": ["Secured initial funding sources", "Established financial protocols"],
      "Treasurer": ["Managed first major event budgets", "Developed financial sustainability plans"]
    }
  },
  "sai-kaushik": {
    name: "Sai Kaushik Kollepalli",
    major: "M.S. in Business Analytics",
    homeCountry: "India",
    countryFlag: "🇮🇳",
    image: "/assets/officers/Sai.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Essential Needs Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "International Student Support Coordinator" }
    ],
    overallContributions: [
      "Provided expert insight into international student needs through his role in UNT's International Affairs office",
      "Acted as a critical liaison between international students and administrative resources",
      "Offered consistent support in areas related to immigration, housing, and campus navigation",
      "Strengthened ISAB's role in student support and advocacy"
    ],
    roleSpecificHighlights: {
      "Essential Needs Coordinator": ["Conducted student needs assessments", "Developed resource databases"],
      "International Student Support Coordinator": ["Provided immigration guidance", "Streamlined university processes"]
    }
  },
  "laura-decesero": {
    name: "Laura DeCesero",
    major: "B.S. in Biomedical Engineering",
    homeCountry: "Italy",
    countryFlag: "🇮🇹",
    image: "/assets/officers/Laura.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "International Student Support Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Secretary" }
    ],
    overallContributions: [
      "Designed a comprehensive international student survey still used by ISAB today",
      "Served as Secretary, ensuring smooth communication and coordination",
      "Helped plan and execute Rhythms of the World, one of ISAB's most impactful events",
      "Improved organizational consistency through structured documentation practices"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Conducted comprehensive needs assessment survey", "Co-organized Rhythms of the World"],
      "Secretary": ["Improved documentation systems", "Enhanced organizational continuity"]
    }
  },
  "chaehyeon-kim": {
    name: "Chaehyeon Kim", 
    major: "B.A. in Art",
    homeCountry: "South Korea",
    countryFlag: "🇰🇷",
    image: "/assets/officers/Chaehyeon.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Communications Coordinator" }
    ],
    overallContributions: [
      "Led ISAB's initial growth on social media, improving visibility and branding",
      "Designed the first official officer announcement posts and set tone for future content",
      "Created content guidelines that shaped ISAB's public image",
      "Initiated early-stage marketing strategies that drove student engagement"
    ],
    roleSpecificHighlights: {
      "Communications Coordinator": ["Established social media presence", "Created first officer introduction posts"]
    }
  },
  "yong-pappunggon": {
    name: "Yong Pappunggon",
    major: "B.B.A. in Accounting", 
    homeCountry: "Thailand",
    countryFlag: "🇹🇭",
    image: "/assets/officers/Yong.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Spring 2024", period: "Spring 2024", role: "Event Coordinator" },
      { semester: "Fall 2024", period: "Fall 2024", role: "Event Coordinator" }
    ],
    overallContributions: [
      "Organized the first Songkran Festival at UNT, setting a new standard for international cultural events",
      "Coordinated numerous foundational events that elevated ISAB's presence",
      "Developed scalable event planning processes adopted by future boards",
      "Built relationships with student orgs and community partners to expand impact"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organized inaugural Songkran Festival", "Developed event planning frameworks"]
    }
  },
  "suma-geethika": {
    name: "Suma Geethika",
    major: "M.S. in Data Science",
    homeCountry: "India", 
    countryFlag: "🇮🇳",
    image: "/assets/officers/Suma.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "International Student Support Coordinator" }
    ],
    overallContributions: [
      "Supported ISAB's student support initiatives during the Fall semester",
      "Played a key role in data collection for town hall advocacy",
      "Helped organize events crucial to maintaining ISAB's momentum and visibility",
      "Facilitated leadership transition during a period of rapid organizational growth"
    ],
    roleSpecificHighlights: {
      "International Student Support Coordinator": ["Provided student support during fall semester", "Collected data for town hall meetings"]
    }
  },
  "marina-menegusso": {
    name: "Marina Cestari Menegusso",
    major: "B.A. in English",
    homeCountry: "Brazil",
    countryFlag: "🇧🇷",
    image: "/assets/officers/Marina.jpg", 
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Outreach Coordinator" }
    ],
    overallContributions: [
      "Ensured timely event promotion and consistent social media engagement",
      "Served as ISAB's event photographer, preserving organizational history",
      "Collected and organized officer biography content for internal documentation",
      "Contributed to increased visibility and student connection through outreach"
    ],
    roleSpecificHighlights: {
      "Outreach Coordinator": ["Posted every event on time", "Documented ISAB history through photography"]
    }
  },
  "iman-mohammed": {
    name: "Iman Mohammed",
    major: "B.S. in Business Analytics", 
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/Iman.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Secretary" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Secretary" }
    ],
    overallContributions: [
      "Manages meeting notes, internal communication, and documentation standards",
      "Assists in coordination of current initiatives and officer collaboration",
      "Supports ISAB's mission through consistent advocacy and student outreach"
    ],
    roleSpecificHighlights: {
      "Secretary": ["Maintains documentation standards", "Supports member coordination"]
    }
  },
  "shiori-hisaoka": {
    name: "Shiori Hisaoka",
    major: "B.A. in Psychology",
    homeCountry: "Japan",
    countryFlag: "🇯🇵", 
    image: "/assets/officers/Shiori.jpg",
    hasPhoto: true,
    roles: [
      { semester: "Fall 2024", period: "Fall 2024", role: "Event Coordinator" },
      { semester: "Spring 2025", period: "Spring 2025", role: "Outreach Coordinator" }
    ],
    overallContributions: [
      "Played a key role in organizing cultural events that promote student inclusion",
      "Transitioned from event coordination to outreach to broaden ISAB's reach",
      "Strengthens partnerships with student organizations through collaborative planning",
      "Enhances engagement through social media, tabling, and awareness campaigns"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organized cultural celebrations", "Enhanced event programming"],
      "Outreach Coordinator": ["Expanded campus presence", "Increased student engagement"]
    }
  },
  "mohammed-abubeker": {
    name: "Mohammed Abubeker",
    major: "B.B.A. in Business Computer Information Systems",
    homeCountry: "Ethiopia",
    countryFlag: "🇪🇹",
    image: "/assets/officers/Mohammed.jpg", 
    hasPhoto: true,
    roles: [
      { semester: "Spring 2025", period: "Spring 2025", role: "Event Coordinator" }
    ],
    overallContributions: [
      "Leads the planning and execution of current ISAB events with a focus on cultural enrichment",
      "Builds community through engaging and accessible programming",
      "Ensures event quality through detailed planning, logistics, and feedback integration",
      "Continues ISAB's legacy of innovative and inclusive campus events"
    ],
    roleSpecificHighlights: {
      "Event Coordinator": ["Organizes cultural programming", "Maintains event quality standards"]
    }
  }
};

export const semesterBoards: SemesterBoard[] = [
  {
    id: 'founding-board-2023',
    title: 'Founding Board',
    period: 'December 2023',
    description: 'The inaugural leadership team that established ISAB from the ground up. This foundational group built the organizational framework, secured university recognition, and laid the groundwork for long-term success. Key achievements: Official founding of ISAB, initial recruitment of members, creation of ISAB\'s constitution and charter.',
    coverImage: '/assets/boards/founding-2023/cover.jpeg',
    totalOfficers: 4,
    officers: [
      { id: "adrian-tam", role: "Founding President" },
      { id: "amaris-charles", role: "Founding Vice President" },
      { id: "ibrahim-abubeker", role: "Founding Secretary" },
      { id: "bhavesh-gujula", role: "Founding Treasurer" }
    ]
  },
  {
    id: 'spring-2024-board',
    title: 'Spring 2024 Board', 
    period: 'Spring 2024',
    description: 'A transformative team of eight that expanded ISAB\'s reach and campus presence. This group organized key events, strengthened internal structure, and enhanced student engagement through active outreach. Key achievements: Hosted the first Songkran Festival, organized ISAB\'s first Town Hall, expanded general membership and officer team, strengthened ISAB\'s standing as a recognized student organization through visible and consistent programming.',
    coverImage: '/assets/boards/spring-2024/cover.jpg',
    totalOfficers: 8,
    officers: [
      { id: "adrian-tam", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "ibrahim-abubeker", role: "Secretary" },
      { id: "bhavesh-gujula", role: "Treasurer" },
      { id: "sai-kaushik", role: "Essential Needs Coordinator" },
      { id: "laura-decesero", role: "International Student Support Coordinator" },
      { id: "chaehyeon-kim", role: "Communications Coordinator" },
      { id: "yong-pappunggon", role: "Event Coordinator" }
    ]
  },
  {
    id: 'fall-2024-board',
    title: 'Fall 2024 Board',
    period: 'Fall 2024', 
    description: 'A period of consolidation and expanded campus engagement. This experienced team focused on building lasting infrastructure, strengthening partnerships, and deepening ISAB\'s impact on international student life. Key achievements: Organized and co-led Rhythms of the World, one of UNT\'s largest multicultural celebrations, in collaboration with multiple student organizations; increased ISAB visibility through Homecoming Week participation; designed and distributed a comprehensive international student experience survey, now a recurring tool for feedback and advocacy; expanded ISAB\'s digital presence through strategic social media growth and branding consistency.',
    coverImage: '/assets/boards/fall-2024/cover.jpeg',
    totalOfficers: 8,
    officers: [
      { id: "ibrahim-abubeker", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "laura-decesero", role: "Secretary" },
      { id: "suma-geethika", role: "International Student Support Coordinator" },
      { id: "sai-kaushik", role: "International Student Support Coordinator" },
      { id: "yong-pappunggon", role: "Event Coordinator" },
      { id: "shiori-hisaoka", role: "Event Coordinator" },
      { id: "marina-menegusso", role: "Outreach Coordinator" }
    ]
  },
  {
    id: 'spring-2025-board',
    title: 'Spring 2025 Board',
    period: 'Spring 2025',
    description: 'An innovation-driven team focused on refining ISAB\'s identity and maximizing its campus impact. This smaller, agile board emphasized strategic engagement and meaningful partnerships, leading to some of ISAB\'s most effective outreach efforts to date. Key achievements: Improved the Town Hall format to encourage more open discussion and participation; strengthened intercollegiate ties with the University of Oklahoma\'s International Advisory Committee (OU IAC); achieved significantly higher engagement and attendance at events compared to previous semesters; continued annual traditions with the second Songkran Festival; enhanced outreach through improved branding and Google Calendar integration.',
    coverImage: '/assets/boards/spring-2025/cover.jpeg',
    totalOfficers: 5,
    officers: [
      { id: "ibrahim-abubeker", role: "President" },
      { id: "amaris-charles", role: "Vice President" },
      { id: "iman-mohammed", role: "Secretary" },
      { id: "shiori-hisaoka", role: "Outreach Coordinator" },
      { id: "mohammed-abubeker", role: "Event Coordinator" }
    ]
  }
];