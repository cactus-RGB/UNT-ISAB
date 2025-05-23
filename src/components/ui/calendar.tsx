"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single" | "range" | "multiple"; // Keep in interface for API compatibility
}

const Calendar = ({ className, selected, onSelect, ...props }: CalendarProps) => {
  // Notice we're not destructuring 'mode' from props to avoid the ESLint error
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Generate arrays of day numbers for the current month view
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Array to hold all the day cells (including empty ones for proper alignment)
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if a day is the selected day
  const isSelectedDay = (day: number) => {
    if (!selected || !day) return false;

    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Check if a day is today
  const isToday = (day: number) => {
    if (!day) return false;
    
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Handle day selection
  const handleSelectDay = (day: number | null) => {
    if (!day || !onSelect) return;

    const selectedDate = new Date(currentMonth);
    selectedDate.setDate(day);
    onSelect(selectedDate);
  };

  // Mouse enter handler for hover effects
  const handleMouseEnter = (day: number | null) => {
    setHoveredDay(day);
  };

  // Mouse leave handler for hover effects
  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Get the days array for rendering
  const daysArray = getDaysInMonth();

  return (
    <div className={`border rounded-md p-3 transition-all duration-300 hover:shadow-md ${className || ""}`} {...props}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-primary/10 transition-all duration-300 hover:text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>

        <div className="font-bold text-center">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        <button 
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-primary/10 transition-all duration-300 hover:text-primary"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, index) => (
          <button
            key={index}
            className={`
              h-8 w-8 rounded-md text-sm flex items-center justify-center
              transition-all duration-200
              ${!day ? 'cursor-default' : 'hover:bg-primary/20 hover:text-primary'}
              ${isSelectedDay(day as number) ? 'bg-primary text-primary-foreground' : ''}
              ${isToday(day as number) && !isSelectedDay(day as number) ? 'border border-primary text-primary' : ''}
              ${hoveredDay === day ? 'bg-primary/10 text-primary' : ''}
            `}
            disabled={!day}
            onClick={() => handleSelectDay(day)}
            onMouseEnter={() => handleMouseEnter(day)}
            onMouseLeave={handleMouseLeave}
            aria-label={day ? `Select ${day} ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Empty day'}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export { Calendar };