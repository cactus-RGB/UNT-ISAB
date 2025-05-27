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
            <p className="text-secondary">Email: untisab23@gmail.com</p>
            <p className="text-secondary">Office: Marquis Hall 1511 W Mulberry St, Denton, TX 76201</p>
            <p className="text-secondary">Phone: (214)-801-6149</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground hover:text-secondary flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" /> Instagram
              </a>
              <a href="#" className="text-primary-foreground hover:text-secondary flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" /> Twitter
              </a>
              <a href="#" className="text-primary-foreground hover:text-secondary flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" /> Facebook
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