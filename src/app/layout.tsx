import "@/app/globals.css";
import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
  return (
    <footer className="bg-primary-gradient text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ISAB at UNT</h3>
            <p className="text-secondary">
              Supporting international students and fostering cultural exchange at 
              the University of North Texas.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-secondary">
                Email: <a 
                  href="mailto:untisab23@gmail.com" 
                  className="text-primary-foreground hover:text-secondary underline transition-colors duration-200"
                >
                  untisab23@gmail.com
                </a>
              </p>
              <p className="text-secondary">
                Office: <a 
                  href="https://maps.google.com/?q=Marquis+Hall+1511+W+Mulberry+St+Denton+TX+76201" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground hover:text-secondary underline transition-colors duration-200"
                >
                  Marquis Hall 1511 W Mulberry St, Denton, TX 76201
                </a>
              </p>
              <p className="text-secondary">
                Phone: <a 
                  href="tel:+12148016149" 
                  className="text-primary-foreground hover:text-secondary underline transition-colors duration-200"
                >
                  (214)-801-6149
                </a>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow UNT</h3>
            <div className="space-y-3">
              <a 
                href="https://www.instagram.com/untisab?igsh=amJqYXViZ2lvcHl4" 
                className="text-primary-foreground hover:text-secondary flex items-center transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> ISAB
              </a>
              <a 
                href="https://www.instagram.com/untinternational?igsh=d2d5Z3F0YWluYzNy" 
                className="text-primary-foreground hover:text-secondary flex items-center transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> International Affairs
              </a>
              <a 
                href="https://www.instagram.com/unt?igsh=aHR4MzhzZ3lxYnhx" 
                className="text-primary-foreground hover:text-secondary flex items-center transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> UNT
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-secondary mt-8 pt-6 text-center text-secondary">
          <p>&copy; {new Date().getFullYear()} International Student Advisory Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}