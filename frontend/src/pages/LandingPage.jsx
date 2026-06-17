import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../components/LogoIcon';
import { 
  Compass, 
  Upload, 
  Map, 
  FileText, 
  ArrowRight, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Share2 
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Animation constants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: 'rgb(var(--bg-primary))', color: 'rgb(var(--text-primary))' }}>
      
      {/* Top Navbar */}
      <header className="glass sticky top-0 z-50 backdrop-blur-md" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-ocean-500 to-emerald-500 shadow-md shadow-ocean-950/20">
              <LogoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-ocean-600 via-emerald-600 to-gold-600 dark:from-ocean-400 dark:via-emerald-400 dark:to-gold-400 bg-clip-text text-transparent">
              TripNest
            </span>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary flex items-center space-x-1 sm:space-x-1.5 py-1.5 px-3 sm:py-2 sm:px-5 text-xs sm:text-sm">
                <span>{t('nav.goToDashboard')}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-xs sm:text-sm transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="btn-accent py-1.5 px-3 sm:py-2 sm:px-5 text-xs sm:text-sm shadow-sunset-900/10">
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax Travel Image & Gradients */}
      <section className="relative min-h-[85vh] flex items-center py-20 overflow-hidden">
        {/* Background Image with Dark Gradients */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920" 
            alt="Travel Adventure" 
            className="w-full h-full object-cover object-center opacity-30"
          />
          {/* Radial & linear gradient overlay for luxury visual blend */}
          {/* Always dark overlay so white text is readable in both themes */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(2,8,23,0.92) 0%, rgba(2,8,23,0.75) 50%, rgba(2,8,23,0.2) 100%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,23,0.7) 0%, transparent 50%, rgba(2,8,23,0.3) 100%)' }}></div>
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-ocean-500/10 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sunset-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-8 space-y-6"
            >
              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                {t('landing.headline1')} <br />
                <span className="bg-gradient-to-r from-ocean-400 via-sunset-400 to-gold-400 bg-clip-text text-transparent">
                  {t('landing.headline2')}
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {t('landing.subheadline')}
              </motion.p>

              {/* Action Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="w-full sm:w-auto btn-accent py-3.5 px-8 text-base flex items-center justify-center space-x-2">
                    <span>{t('landing.startPlanning')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto btn-accent py-3.5 px-8 text-base flex items-center justify-center space-x-2 shadow-sunset-900/20">
                      <span>{t('landing.startPlanning')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => {
                        navigate('/dashboard');
                        setTimeout(() => {
                          document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="w-full sm:w-auto btn-secondary py-3.5 px-8 text-base flex items-center justify-center"
                    >
                      {t('landing.exploreDestinations')}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right side teaser card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-4 hidden lg:block"
            >
              <div className="glass-card p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                {/* Tiny image backdrop */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]"></div>
                
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  <Sparkles className="w-5 h-5 text-gold-400" />
                  <span>AI Powered Magic</span>
                </h3>
                <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgb(var(--text-muted))' }}>
                  Say goodbye to manually mapping itineraries. Upload any booking confirmation, and let Gemini construct your complete sightseeing checklist.
                </p>

                {/* Simulated Ticket UI */}
                <div className="p-4 rounded-2xl relative" style={{ backgroundColor: 'rgb(var(--bg-muted))', border: '1px solid rgb(var(--border-color))' }}>
                  <div className="flex justify-between items-center text-xs font-mono mb-2" style={{ color: 'rgb(var(--text-muted))' }}>
                    <span>BOARDING PASS</span>
                    <span>FLIGHT AI-104</span>
                  </div>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '2px dashed rgb(var(--border-color))' }}>
                    <div>
                      <p className="text-xl font-black text-ocean-400">NYC</p>
                      <p className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>New York</p>
                    </div>
                    <Compass className="w-6 h-6 text-sunset-400 animate-spin" style={{ animationDuration: '12s' }} />
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">PAR</p>
                      <p className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>Paris</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'rgb(var(--text-muted))' }}>Class</p>
                      <p className="font-bold" style={{ color: 'rgb(var(--text-secondary))' }}>Adventure First</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase" style={{ color: 'rgb(var(--text-muted))' }}>Duration</p>
                      <p className="font-bold" style={{ color: 'rgb(var(--text-secondary))' }}>7 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Steps Visualizer */}
      <section className="py-24 relative" style={{ borderTop: '1px solid rgb(var(--border-color))', backgroundColor: 'rgba(var(--bg-muted), 0.4)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sunset-400 font-mono">{t('landing.workflow')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>
              {t('landing.stepsTitle')}
            </h2>
            <p className="max-w-md mx-auto text-sm sm:text-base mt-2" style={{ color: 'rgb(var(--text-muted))' }}>
              {t('landing.stepsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative hover:border-ocean-500/30">
              <div className="w-16 h-16 rounded-2xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center text-ocean-400 mb-6">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.step1Title')}</h3>
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.step1Desc')}</p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative hover:border-sunset-500/30">
              <div className="w-16 h-16 rounded-2xl bg-sunset-500/10 border border-sunset-500/20 flex items-center justify-center text-sunset-400 mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.step2Title')}</h3>
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.step2Desc')}</p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative hover:border-emerald-500/30">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.step3Title')}</h3>
              <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 relative" style={{ borderTop: '1px solid rgb(var(--border-color))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-ocean-400 font-mono">{t('landing.featuresLabel')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.featuresTitle')}</h2>
            <p className="max-w-md mx-auto text-sm sm:text-base mt-2" style={{ color: 'rgb(var(--text-muted))' }}>
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature1Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature1Desc')}</p>
            </div>

            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature2Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature2Desc')}</p>
            </div>

            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature3Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature3Desc')}</p>
            </div>

            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature4Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature4Desc')}</p>
            </div>

            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature5Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature5Desc')}</p>
            </div>

            <div className="glass-card p-7 rounded-2xl flex flex-col hover:border-ocean-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center mb-5 text-ocean-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('landing.feature6Title')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{t('landing.feature6Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-sm mt-auto" style={{ borderTop: '1px solid rgb(var(--border-color))', backgroundColor: 'rgb(var(--bg-primary))', color: 'rgb(var(--text-muted))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <LogoIcon className="w-5 h-5 text-ocean-450" />
            <span className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>TripNest</span>
          </div>
          <p>© 2026 TripNest. {t('footer.rights')}</p>
          <div className="flex space-x-6">
            <span className="hover:text-ocean-400 cursor-pointer transition-colors">{t('footer.privacy')}</span>
            <span className="hover:text-ocean-400 cursor-pointer transition-colors">{t('footer.terms')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
