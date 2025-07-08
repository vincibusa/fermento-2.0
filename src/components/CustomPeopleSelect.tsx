import React, { useState, useRef, useEffect } from "react";
import { FiUsers, FiPlus, FiMinus, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface CustomPeopleSelectProps {
  value: number;
  onChange: (people: number) => void;
  error?: string;
  label: string;
  min?: number;
  max?: number;
}

const CustomPeopleSelect: React.FC<CustomPeopleSelectProps> = ({
  value,
  onChange,
  error,
  label,
  min = 1,
  max = 10
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

  const handlePeopleSelect = (people: number) => {
    onChange(people);
    setIsOpen(false);
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const peopleOptions = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const getPeopleText = (num: number) => {
    return `${num} ${num === 1 ? t("reservationModal.personSingular") : t("reservationModal.personPlural")}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-body text-foreground mb-2">
        {label}
      </label>
      
      {/* Counter Style Display */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
            value <= min 
              ? 'border-input/50 text-muted-foreground/50 cursor-not-allowed' 
              : 'border-input text-foreground hover:bg-accent/10 active:bg-accent/20'
          }`}
        >
          <FiMinus size={16} />
        </button>
        
        <div className="flex-1 text-center">
          <div className="text-lg font-medium text-foreground">
            {value}
          </div>
          <div className="text-sm text-muted-foreground">
            {value === 1 ? t("reservationModal.personSingular") : t("reservationModal.personPlural")}
          </div>
        </div>
        
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
            value >= max 
              ? 'border-input/50 text-muted-foreground/50 cursor-not-allowed' 
              : 'border-input text-foreground hover:bg-accent/10 active:bg-accent/20'
          }`}
        >
          <FiPlus size={16} />
        </button>
      </div>

      {/* Alternative Dropdown Style */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center px-4 py-3 rounded-md border text-left ${
            error ? "border-destructive" : "border-input"
          } focus:outline-none focus:ring-2 focus:ring-ring bg-background hover:bg-accent/5 transition-colors`}
        >
          <FiUsers className="mr-3 text-accent flex-shrink-0" size={18} />
          <span className="flex-1 text-foreground">
            {getPeopleText(value)}
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

      {/* People options dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {peopleOptions.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handlePeopleSelect(num)}
              className={`w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                value === num ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
              }`}
            >
              <div className="flex items-center">
                <FiUsers className="mr-3 text-accent" size={16} />
                {getPeopleText(num)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomPeopleSelect; 