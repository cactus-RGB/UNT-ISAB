"use client";

import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div 
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }: CardProps) => {
  return (
    <h3 className={`text-lg font-semibold ${className || ""}`} {...props}>
      {children}
    </h3>
  );
};

const CardContent = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={`p-6 pt-0 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };