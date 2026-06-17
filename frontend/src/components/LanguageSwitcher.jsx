import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    // Handle RTL for Arabic
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="language-switcher-btn"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group"
        style={{
          color: 'rgb(var(--text-secondary))',
          border: '1px solid rgb(var(--border-color))',
          backgroundColor: 'rgb(var(--bg-surface))'
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 text-ocean-400 group-hover:text-ocean-300 transition-colors" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'rgb(var(--text-muted))' }}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden z-[100] animate-fade-in"
          style={{
            backgroundColor: 'rgb(var(--bg-surface))',
            border: '1px solid rgb(var(--border-color))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}
          role="listbox"
        >
          {/* Header */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>Select Language</p>
          </div>

          {/* Language List */}
          <ul className="py-1.5 max-h-72 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <li key={lang.code}>
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive ? 'bg-ocean-500/15 text-ocean-400' : ''
                    }`}
                    style={!isActive ? { color: 'rgb(var(--text-secondary))' } : {}}
                    onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'rgb(var(--bg-muted))')}
                    onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span className="flex items-center space-x-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-ocean-400 flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
