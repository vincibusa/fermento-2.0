import React, { useState, useRef, useEffect } from "react";
import { FiClock, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface CustomTimeSelectProps {
  value: string;
  onChange: (time: string) => void;
  options: string[];
  error?: string;
  label: string;
  placeholder?: string;
}

const CustomTimeSelect: React.FC<CustomTimeSelectProps> = ({
  value,
  onChange,
  options,
  error,
  label,
  placeholder
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

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
          <FiClock className="mr-3 text-accent flex-shrink-0" size={18} />
          <span className={`flex-1 ${!value ? 'text-muted-foreground' : 'text-foreground'}`}>
            {value || placeholder || t("reservationModal.timePlaceholder")}
          </span>
          <FiChevronDown 
            className={`ml-2 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
            size={16} 
          />
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

      {/* Time options dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            <>
              {options.map((time, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    value === time ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <div className="flex items-center">
                    <FiClock className="mr-3 text-accent" size={16} />
                    {time}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <FiClock className="mx-auto mb-2" size={24} />
              <p className="text-sm">
                {t("reservationModal.noTimeSlots")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomTimeSelect; 