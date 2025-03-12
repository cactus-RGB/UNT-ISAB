"use client";

import React, { useState } from "react";

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const Calendar = ({ className, selected, onSelect, ...props }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  // Simple placeholder calendar component
  return (
    <div className={`border rounded-md p-3 ${className || ""}`} {...props}>
      <div className="text-center mb-4">
        <div className="font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {/* This is just a placeholder grid - a real implementation would render the actual days */}
        {Array.from({ length: 35 }, (_, i) => (
          <button 
            key={i} 
            className="h-8 w-8 rounded-md hover:bg-gray-100 text-sm"
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setDate(i + 1 - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay());
              onSelect?.(newDate);
            }}
          >
            {i + 1 - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() > 0 && 
             i + 1 - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() 
              ? i + 1 - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() 
              : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

export { Calendar };