import React, { useState, useRef, useEffect } from "react";
import { FiPhone, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

interface CustomPhoneInputProps {
  value: string;
  countryCode: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeChange: (countryCode: string) => void;
  error?: string;
  label: string;
  placeholder?: string;
}

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  countryCode,
  onPhoneChange,
  onCountryCodeChange,
  error,
  label,
  placeholder
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryCodes: CountryCode[] = [
    { code: "+39", country: "Italia", flag: "🇮🇹" },
    { code: "+33", country: "Francia", flag: "🇫🇷" },
    { code: "+49", country: "Germania", flag: "🇩🇪" },
    { code: "+34", country: "Spagna", flag: "🇪🇸" },
    { code: "+44", country: "Regno Unito", flag: "🇬🇧" },
    { code: "+1", country: "Stati Uniti", flag: "🇺🇸" },
    { code: "+41", country: "Svizzera", flag: "🇨🇭" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+31", country: "Paesi Bassi", flag: "🇳🇱" },
    { code: "+32", country: "Belgio", flag: "🇧🇪" },
    { code: "+351", country: "Portogallo", flag: "🇵🇹" },
    { code: "+30", country: "Grecia", flag: "🇬🇷" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+86", country: "Cina", flag: "🇨🇳" },
    { code: "+81", country: "Giappone", flag: "🇯🇵" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+55", country: "Brasile", flag: "🇧🇷" },
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+1", country: "Canada", flag: "🇨🇦" }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countryCodes.find(country => country.code === countryCode);

  const handleCountrySelect = (code: string) => {
    onCountryCodeChange(code);
    setIsOpen(false);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Rimuovi tutti i caratteri non numerici, tranne spazi e trattini
    const cleanValue = inputValue.replace(/[^\d\s-]/g, '');
    onPhoneChange(cleanValue);
  };

  return (
    <div>
      <label className="block text-sm font-body text-foreground mb-2">
        {label}
      </label>
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center px-3 py-3 rounded-md border text-left min-w-[100px] ${
              error ? "border-destructive" : "border-input"
            } focus:outline-none focus:ring-2 focus:ring-ring bg-background hover:bg-accent/5 transition-colors`}
          >
            <span className="mr-2 text-lg">{selectedCountry?.flag}</span>
            <span className="text-sm font-medium">{selectedCountry?.code}</span>
            <FiChevronDown 
              className={`ml-1 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
              size={14} 
            />
          </button>

          {/* Country dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[250px]">
              {countryCodes.map((country, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCountrySelect(country.code)}
                  className={`w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    countryCode === country.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{country.flag}</span>
                    <span className="mr-2 font-medium">{country.code}</span>
                    <span className="text-sm text-muted-foreground">{country.country}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" size={18} />
            <input
              type="tel"
              value={value}
              onChange={handlePhoneInput}
              className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                error ? "border-destructive" : "border-input"
              } focus:outline-none focus:ring-2 focus:ring-ring`}
              placeholder={placeholder || t("reservationModal.phonePlaceholder")}
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      
      {/* Helper text */}
      <p className="mt-1 text-xs text-muted-foreground">
        {t("reservationModal.phoneHelper")}
      </p>
    </div>
  );
};

export default CustomPhoneInput; 