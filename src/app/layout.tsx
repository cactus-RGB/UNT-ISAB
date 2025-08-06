import "@/app/globals.css";
import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '0.8';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  return (
    <footer className="bg-primary-gradient py-8 mt-auto" style={{ color: 'white' }}>
      <div className="container mx-auto px-6" style={{ color: 'white' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ color: 'white' }}>
          <div style={{ color: 'white' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>ISAB at UNT</h3>
            <p style={{ color: 'white', opacity: 0.9 }}>
              Supporting international students and fostering cultural exchange at 
              the University of North Texas.
            </p>
          </div>
          <div style={{ color: 'white' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>Contact Us</h3>
            <div className="space-y-2">
              <p style={{ color: 'white', opacity: 0.9 }}>
                Email: <a 
                  href="mailto:untisab23@gmail.com" 
                  className="underline transition-colors duration-200"
                  style={{ color: 'white' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  untisab23@gmail.com
                </a>
              </p>
              <p style={{ color: 'white', opacity: 0.9 }}>
                Office: <a 
                  href="https://maps.google.com/?q=Marquis+Hall+1511+W+Mulberry+St+Denton+TX+76201" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline transition-colors duration-200"
                  style={{ color: 'white' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Marquis Hall 1511 W Mulberry St, Denton, TX 76201
                </a>
              </p>
              <p style={{ color: 'white', opacity: 0.9 }}>
                Phone: <a 
                  href="tel:+12148016149" 
                  className="underline transition-colors duration-200"
                  style={{ color: 'white' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  (214)-801-6149
                </a>
              </p>
            </div>
          </div>
          <div style={{ color: 'white' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>Follow UNT</h3>
            <div className="space-y-3">
              <a 
                href="https://www.instagram.com/untisab?igsh=amJqYXViZ2lvcHl4" 
                className="flex items-center transition-colors duration-200"
                style={{ color: 'white' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ExternalLink className="h-4 w-4 mr-2" style={{ color: 'white' }} /> ISAB
              </a>
              <a 
                href="https://www.instagram.com/untinternational?igsh=d2d5Z3F0YWluYzNy" 
                className="flex items-center transition-colors duration-200"
                style={{ color: 'white' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ExternalLink className="h-4 w-4 mr-2" style={{ color: 'white' }} /> International Affairs
              </a>
              <a 
                href="https://www.instagram.com/unt?igsh=aHR4MzhzZ3lxYnhx" 
                className="flex items-center transition-colors duration-200"
                style={{ color: 'white' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ExternalLink className="h-4 w-4 mr-2" style={{ color: 'white' }} /> UNT
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white', opacity: 0.9 }}>
          <p>&copy; {new Date().getFullYear()} International Student Advisory Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}