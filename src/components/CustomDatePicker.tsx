import React, { useState, useRef, useEffect } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  error?: string;
  label: string;
  placeholder?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locale = i18n.language === 'it' ? it : enUS;
  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 31));
  };

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -31));
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today);
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-body text-foreground mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center px-4 py-3 rounded-md border text-left ${
            error ? "border-destructive" : "border-input"
          } focus:outline-none focus:ring-2 focus:ring-ring bg-background hover:bg-accent/5 transition-colors`}
        >
          <FiCalendar className="mr-3 text-accent flex-shrink-0" size={18} />
          <span className={`flex-1 ${!value ? 'text-muted-foreground' : 'text-foreground'}`}>
            {value ? format(new Date(value), 'dd/MM/yyyy', { locale }) : placeholder || t("reservationModal.selectDate")}
          </span>
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 p-4">
          {/* Header with month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 hover:bg-accent/10 rounded-md transition-colors"
            >
              <FiChevronLeft size={18} />
            </button>
            
            <h3 className="font-medium text-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale })}
            </h3>
            
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-accent/10 rounded-md transition-colors"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-md transition-colors
                    ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${isToday && !isSelected ? 'bg-accent/20 text-accent' : ''}
                    ${isDisabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'hover:bg-accent/10 cursor-pointer'}
                    ${!isSelected && !isToday && !isDisabled && isCurrentMonth ? 'text-foreground' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-3 border-t border-input">
            <button
              type="button"
              onClick={() => handleDateSelect(today)}
              className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
            >
              {t("reservationModal.today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker; 