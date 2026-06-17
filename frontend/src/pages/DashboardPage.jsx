import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadDocument, getItineraries, deleteItinerary } from '../services/itineraryService';
import { exportItineraryToPDF } from '../utils/pdfExport';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  FileUp, 
  Compass, 
  Sparkles,
  MapPin,
  Calendar,
  Share2,
  Trash2,
  Download,
  Eye,
  Globe,
  Award,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

const POPULAR_DESTINATIONS = [
  {
    name: 'Bali',
    country: 'Indonesia',
    desc: 'Tropical beaches, ancient temples, and beautiful green terraced rice fields.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Paris',
    country: 'France',
    desc: 'The city of light, filled with romantic cafes, historic architecture, and fine art.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    desc: 'Ultramodern skyscrapers, historic shrines, and world-class culinary experiences.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Goa',
    country: 'India',
    desc: 'Stunning sandy shorelines, vibrant coastal cuisine, and Portuguese heritage sites.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Switzerland',
    country: 'Europe',
    desc: 'Epic snow-covered peaks, emerald lakes, and cozy alpine villages.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dubai',
    country: 'UAE',
    desc: 'Luxury skyscrapers, futuristic architecture, and gold shopping bazaars.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80'
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Upload States
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const { t } = useTranslation();

  // Fetch travel history to compute stats
  const fetchHistory = async () => {
    try {
      const response = await getItineraries();
      if (response.success) {
        setTrips(response.data);
      }
    } catch (err) {
      console.error('Failed to load history on dashboard:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    setError(null);
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError(rejectedFiles[0].errors[0]?.message || 'File rejected. Upload PDF/Image under 10MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await uploadDocument(file, (percent) => {
        setProgress(percent);
        if (percent === 100) {
          setUploading(false);
          setProcessing(true);
        }
      });

      if (response.success && response.data) {
        sessionStorage.setItem('tempExtractedData', JSON.stringify(response.data.extractedData));
        sessionStorage.setItem('tempFileMetadata', JSON.stringify(response.data.tempFile));
        navigate('/review');
      } else {
        throw new Error(response.message || 'Parsing failed.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to parse. Make sure document has readable travel details.';
      setError(errorMessage);
      setFile(null);
      setProgress(0);
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t('history.deleteConfirm'))) return;
    setDeletingId(id);
    try {
      const response = await deleteItinerary(id);
      if (response.success) {
        setTrips(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Stats Calculator
  const tripsCount = trips.length;
  const uniqueDestinations = new Set(trips.map(t => t.extractedData.destination.trim())).size;
  const sharedCount = trips.filter(t => t.isPublic).length;

  return (
    <div className="space-y-16 font-sans">
      
      {/* 1. Full-Width Travel Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[45vh] flex items-center p-8 sm:p-12 shadow-2xl" style={{ border: '1px solid rgb(var(--border-color))' }}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600" 
            alt="Travel beach background" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Always dark overlay so white text is readable in both themes */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(2,8,23,0.90) 0%, rgba(2,8,23,0.70) 55%, rgba(2,8,23,0.25) 100%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,23,0.70) 0%, transparent 50%)' }}></div>
        </div>

        <div className="relative z-10 max-w-2xl space-y-5 hero-overlay-text">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sunset-500/20 border border-sunset-500/30 text-sunset-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('dashboard.aiAssistant')}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {t('dashboard.heroTitle')}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t('dashboard.heroSubtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                setShowUploadPanel(true);
                setTimeout(() => {
                  document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="btn-accent py-3 px-8 text-sm font-semibold flex items-center space-x-2"
            >
              <span>{t('dashboard.startPlanning')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' })}
              className="py-3 px-8 text-sm font-semibold rounded-xl transition-all duration-200"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}
            >
              {t('dashboard.exploreDestinations')}
            </button>
          </div>
        </div>
      </div>


      {/* 2. Interactive Integrated Upload Panel */}
      {showUploadPanel && (
        <div id="upload-area" className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
              <Sparkles className="w-5.5 h-5.5 text-sunset-400" />
              <span>{t('dashboard.importTitle')}</span>
            </h2>
            <button 
              onClick={() => {
                setShowUploadPanel(false);
                setFile(null);
                setError(null);
              }}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{ color: 'rgb(var(--text-muted))', backgroundColor: 'rgb(var(--bg-muted))' }}
            >
              {t('dashboard.close')}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!uploading && !processing ? (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-ocean-500 bg-ocean-500/5'
                    : ''
                }`}
                style={!isDragActive ? { 
                  borderColor: 'rgb(var(--border-color))',
                  backgroundColor: 'rgb(var(--bg-muted), 0.4)'
                } : {}}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-ocean-400 mb-4 animate-pulse-slow" />
                <p className="font-semibold text-base" style={{ color: 'rgb(var(--text-primary))' }}>{t('dashboard.dropzoneText')}</p>
                <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-muted))' }}>{t('dashboard.dropzoneSubtext')}</p>
              </div>

              {file && (
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'rgb(var(--bg-muted))', border: '1px solid rgb(var(--border-color))' }}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-ocean-450 flex-shrink-0" />
                    <span className="text-sm truncate font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{file.name}</span>
                  </div>
                  <button onClick={handleUpload} className="btn-accent py-2 px-6 text-xs flex items-center space-x-1.5">
                    <FileUp className="w-4 h-4" />
                    <span>{t('dashboard.uploadParse')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
              {uploading ? (
                <div className="w-full max-w-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-ocean-500 border-t-transparent animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('dashboard.uploading')} ({progress}%)</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgb(var(--bg-muted))' }}>
                    <div style={{ width: `${progress}%` }} className="bg-gradient-to-r from-ocean-500 to-emerald-500 h-full transition-all"></div>
                  </div>
                </div>
              ) : (
                <div className="max-w-sm">
                  <Sparkles className="w-8 h-8 text-sunset-400 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{t('dashboard.scanning')}</p>
                  <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{t('dashboard.scanningSubtext')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Quick Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-ocean-500/10 text-ocean-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-muted))' }}>{t('dashboard.tripsGenerated')}</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: 'rgb(var(--text-primary))' }}>{loadingHistory ? '-' : tripsCount}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sunset-500/10 text-sunset-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-muted))' }}>{t('dashboard.destinations')}</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: 'rgb(var(--text-primary))' }}>{loadingHistory ? '-' : uniqueDestinations}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-muted))' }}>{t('dashboard.publicLinks')}</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: 'rgb(var(--text-primary))' }}>{loadingHistory ? '-' : sharedCount}</p>
          </div>
        </div>
      </div>

      {/* 4. Recent Journeys (Travel Cards) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
            <Calendar className="w-5.5 h-5.5 text-ocean-400" />
            <span>{t('dashboard.recentJourneys')}</span>
          </h2>
          {trips.length > 0 && (
            <Link to="/history" className="text-xs text-ocean-400 hover:text-ocean-300 font-bold flex items-center gap-0.5">
              <span>{t('dashboard.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loadingHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map(idx => (
              <div key={idx} className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgb(var(--bg-muted))', border: '1px solid rgb(var(--border-color))' }}></div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <Link
                key={trip._id}
                to={`/itinerary/${trip._id}`}
                className="group flex flex-col glass-card rounded-2xl overflow-hidden shadow-md relative"
              >
                <div className="relative h-44 overflow-hidden zoom-img-container" style={{ backgroundColor: 'rgb(var(--bg-muted))' }}>
                  <img
                    src={trip.destinationImage}
                    alt={trip.extractedData.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }}></div>
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        exportItineraryToPDF(trip);
                      }}
                      className="p-2 rounded-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--bg-primary), 0.8)', color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border-color))' }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(trip._id, e)}
                      className="p-2 rounded-lg backdrop-blur-md text-rose-400" style={{ backgroundColor: 'rgba(var(--bg-primary), 0.8)', border: '1px solid rgb(var(--border-color))' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg group-hover:text-ocean-400 transition-colors truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                      {trip.extractedData.destination}
                    </h3>
                    <p className="text-xs mt-1 flex items-center space-x-1.5" style={{ color: 'rgb(var(--text-muted))' }}>
                      <Calendar className="w-3.5 h-3.5 text-sunset-400" />
                      <span>{trip.duration.days} {t('dashboard.days')} / {trip.duration.nights} {t('dashboard.nights')}</span>
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3.5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgb(var(--border-color))', color: 'rgb(var(--text-muted))' }}>
                    <span>{t('dashboard.voucherParsed')}</span>
                    <span className="text-ocean-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>{t('dashboard.exploreItinerary')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Redesigned Empty State */
          <div className="glass-card p-12 rounded-3xl text-center max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-tr from-sunset-500/10 to-gold-500/10 border border-sunset-500/20 rounded-2xl flex items-center justify-center text-sunset-400 mx-auto mb-6">
              <Compass className="w-8 h-8 animate-pulse-slow" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('dashboard.emptyTitle')}</h3>
            <p className="text-sm max-w-sm mx-auto mb-8" style={{ color: 'rgb(var(--text-muted))' }}>
              {t('dashboard.emptySubtitle')}
            </p>
            <button
              onClick={() => {
                setShowUploadPanel(true);
                setTimeout(() => {
                  document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="btn-accent py-2.5 px-6 text-sm"
            >
              {t('dashboard.startPlanning')}
            </button>
          </div>
        )}
      </div>

      {/* 5. Popular Destinations (Redesigned Premium Cards) */}
      <div id="popular-destinations" className="space-y-6 scroll-mt-20">
        <div className="pb-3" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
            <Globe className="w-5.5 h-5.5 text-ocean-400" />
            <span>{t('dashboard.popularDestinations')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              className="group flex flex-col glass-card rounded-2xl overflow-hidden shadow-md zoom-img-container cursor-pointer"
              onClick={() => {
                setShowUploadPanel(true);
                setTimeout(() => {
                  document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                {/* Always dark overlay on images so white text is readable */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)' }}></div>
                
                {/* Destination Location tag overlay */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-mono font-bold text-sunset-400 uppercase tracking-widest">{dest.country}</span>
                  <h3 className="text-lg font-black mt-0.5" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{dest.name}</h3>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{dest.desc}</p>
                <div className="mt-4 pt-3 flex items-center justify-end text-xs font-bold text-ocean-400" style={{ borderTop: '1px solid rgb(var(--border-color))' }}>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                    <span>{t('dashboard.startPlanning')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Travel Inspiration Section */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('dashboard.tipsTitle')}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
            {t('dashboard.tipsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setShowUploadPanel(true);
            setTimeout(() => {
              document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="btn-primary py-3 px-8 text-sm flex-shrink-0"
        >
          {t('dashboard.buildGuide')}
        </button>
      </div>

    </div>
  );
};

export default DashboardPage;
