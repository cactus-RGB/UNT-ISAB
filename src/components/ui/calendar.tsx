"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single" | "range" | "multiple";
}

const Calendar = ({ className, selected, onSelect, ...props }: CalendarProps) => {
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
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
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

  // Get the days array for rendering
  const daysArray = getDaysInMonth();

  return (
    <div className={`bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 ${className || ""}`} {...props}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110 text-muted-foreground hover:text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="font-semibold text-lg text-foreground">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        <button 
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110 text-muted-foreground hover:text-primary"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day, index) => {
          const isSelected = isSelectedDay(day as number);
          const isTodayDate = isToday(day as number);
          const isHovered = hoveredDay === day;
          
          return (
            <button
              key={index}
              className={`
                h-10 w-10 rounded-lg text-sm font-medium flex items-center justify-center
                transition-all duration-200 relative
                ${!day ? 'cursor-default invisible' : 'cursor-pointer'}
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' 
                  : ''}
                ${isTodayDate && !isSelected 
                  ? 'bg-accent/10 text-accent border-2 border-accent' 
                  : ''}
                ${!isSelected && !isTodayDate && day
                  ? 'text-foreground hover:bg-muted hover:text-primary hover:scale-110' 
                  : ''}
                ${isHovered && !isSelected 
                  ? 'bg-primary/10 text-primary scale-105' 
                  : ''}
              `}
              disabled={!day}
              onClick={() => handleSelectDay(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              aria-label={day ? `Select ${day} ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : undefined}
            >
              {day}
              {isSelected && (
                <div className="absolute inset-0 rounded-lg bg-primary/20 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Calendar };