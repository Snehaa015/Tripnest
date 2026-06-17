import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Calendar, LogOut, Menu, X, User, MapPin, Globe, Sun, Moon } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../components/LogoIcon';

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tripnest_theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tripnest_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'rgb(var(--bg-primary))', color: 'rgb(var(--text-primary))' }}>
      
      {/* Luxury Travel Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgb(var(--border-color), 0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo with Travel Icon */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-ocean-500 to-emerald-500 shadow-lg shadow-ocean-950/20 group-hover:scale-105 transition-all duration-300">
                  <LogoIcon className="w-6 h-6 text-white animate-pulse-slow" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-ocean-600 via-emerald-600 to-gold-600 dark:from-ocean-400 dark:via-emerald-400 dark:to-gold-400 bg-clip-text text-transparent tracking-tight">
                  TripNest
                </span>
              </Link>
            </div>

            {/* Travel-oriented Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ color: 'rgb(var(--text-secondary))' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--text-primary))'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgb(var(--text-secondary))'}
              >
                {t('nav.explore')}
              </Link>
              
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/dashboard') || isActive('/review')
                    ? 'bg-ocean-500/10 text-ocean-400 border border-ocean-500/20'
                    : ''
                }`}
                style={!(isActive('/dashboard') || isActive('/review')) ? { color: 'rgb(var(--text-secondary))' } : {}}
              >
                <Compass className="w-4 h-4 text-ocean-450" />
                <span>{t('nav.planTrip')}</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/history')
                    ? 'bg-ocean-500/10 text-ocean-400 border border-ocean-500/20'
                    : ''
                }`}
                style={!isActive('/history') ? { color: 'rgb(var(--text-secondary))' } : {}}
              >
                <Calendar className="w-4 h-4 text-ocean-450" />
                <span>{t('nav.myJourneys')}</span>
              </Link>

              <button
                onClick={() => {
                  navigate('/dashboard');
                  setTimeout(() => {
                    document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                <MapPin className="w-4 h-4 text-ocean-450" />
                <span>{t('nav.destinations')}</span>
              </button>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl glass text-sm transition-all duration-200 flex items-center justify-center"
                style={{ 
                  color: 'rgb(var(--text-muted))',
                  border: '1px solid rgb(var(--border-color))'
                }}
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' 
                  ? <Sun className="w-4 h-4 text-gold-400" /> 
                  : <Moon className="w-4 h-4 text-slate-500" />
                }
              </button>

              <div 
                className="flex items-center space-x-3 px-4 py-2 rounded-xl"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-muted))',
                  border: '1px solid rgb(var(--border-color))'
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sunset-500 to-gold-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sunset-950/20">
                  {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{user?.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-sunset-400 hover:bg-sunset-500/10 border border-transparent hover:border-sunset-500/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl transition-all duration-200 focus:outline-none"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden px-4 pt-3 pb-6 space-y-2.5 animate-fade-in"
            style={{ 
              borderTop: '1px solid rgb(var(--border-color))',
              backgroundColor: 'rgb(var(--bg-primary))'
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              <Globe className="w-5 h-5 text-ocean-450" />
              <span>{t('nav.explore')}</span>
            </Link>
            
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                isActive('/dashboard') || isActive('/review')
                  ? 'bg-ocean-500/10 text-ocean-450'
                  : ''
              }`}
              style={!(isActive('/dashboard') || isActive('/review')) ? { color: 'rgb(var(--text-secondary))' } : {}}
            >
              <Compass className="w-5 h-5 text-ocean-450" />
              <span>{t('nav.planTrip')}</span>
            </Link>

            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                isActive('/history')
                  ? 'bg-ocean-500/10 text-ocean-450'
                  : ''
              }`}
              style={!isActive('/history') ? { color: 'rgb(var(--text-secondary))' } : {}}
            >
              <Calendar className="w-5 h-5 text-ocean-450" />
              <span>{t('nav.myJourneys')}</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/dashboard');
                setTimeout(() => {
                  document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold text-left transition-all duration-200"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              <MapPin className="w-5 h-5 text-ocean-450" />
              <span>{t('nav.destinations')}</span>
            </button>
            
            <div className="my-3 pt-3" style={{ borderTop: '1px solid rgb(var(--border-color))' }}></div>
            
            {/* Mobile Language & Theme Switcher */}
            <div className="px-1 flex items-center justify-between gap-4">
              <div className="flex-grow">
                <LanguageSwitcher />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl glass flex items-center justify-center transition-all duration-200"
                style={{ 
                  color: 'rgb(var(--text-muted))',
                  border: '1px solid rgb(var(--border-color))'
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-gold-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
              </button>
            </div>
            
            <div className="px-4 py-2 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sunset-500 to-gold-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{user?.name}</span>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold text-sunset-400 hover:bg-sunset-500/10 transition-all duration-200 text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {children}
      </main>

      {/* Luxury Footer */}
      <footer 
        className="py-10 text-center text-sm"
        style={{ 
          borderTop: '1px solid rgb(var(--border-color))',
          backgroundColor: 'rgb(var(--bg-primary))',
          color: 'rgb(var(--text-muted))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <LogoIcon className="w-5 h-5 text-ocean-450" />
            <span className="font-bold tracking-wide" style={{ color: 'rgb(var(--text-primary))' }}>TripNest</span>
          </div>
          <p>© 2026 TripNest. {t('footer.tagline')}</p>
          <div className="flex space-x-6 text-xs">
            <span className="hover:text-ocean-400 transition-colors cursor-pointer">{t('footer.privacy')}</span>
            <span className="hover:text-ocean-400 transition-colors cursor-pointer">{t('footer.terms')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
