import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getItineraries, deleteItinerary } from '../services/itineraryService';
import { exportItineraryToPDF } from '../utils/pdfExport';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Trash2, 
  Calendar, 
  MapPin, 
  Compass, 
  ArrowRight,
  Loader,
  AlertCircle,
  Download,
  Globe
} from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const fetchTrips = async (searchVal = '') => {
    setError(null);
    try {
      const response = await getItineraries(searchVal);
      if (response.success) {
        setItineraries(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(t('history.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setLoading(true);
    fetchTrips(query);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(t('history.deleteConfirm'))) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteItinerary(id);
      if (response.success) {
        setItineraries(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || t('history.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'rgb(var(--text-primary))' }}>{t('history.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-muted))' }}>{t('history.subtitle')}</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('history.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm font-semibold"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-80 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgb(var(--bg-muted))', border: '1px solid rgb(var(--border-color))' }}></div>
          ))}
        </div>
      ) : itineraries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((trip) => {
            const dateStr = new Date(trip.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <Link
                key={trip._id}
                to={`/itinerary/${trip._id}`}
                className="group relative flex flex-col glass-card rounded-2xl overflow-hidden shadow-lg relative"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden zoom-img-container" style={{ backgroundColor: 'rgb(var(--bg-muted))' }}>
                  <img
                    src={trip.destinationImage}
                    alt={trip.extractedData.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 60%)' }}></div>
                  
                  {/* Share Indicator badge */}
                  {trip.isPublic && (
                    <span className="absolute top-4 left-4 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-sunset-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{t('history.sharedLink')}</span>
                    </span>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        exportItineraryToPDF(trip);
                      }}
                      className="p-2 rounded-xl shadow-md backdrop-blur-md"
                      style={{ backgroundColor: 'rgba(var(--bg-primary), 0.9)', color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border-color))' }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(trip._id, e)}
                      disabled={deletingId === trip._id}
                      className="p-2 rounded-xl text-rose-400 shadow-md backdrop-blur-md"
                      style={{ backgroundColor: 'rgba(var(--bg-primary), 0.9)', border: '1px solid rgb(var(--border-color))' }}
                    >
                      {deletingId === trip._id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-ocean-400 transition-colors truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                      {trip.extractedData.destination}
                    </h3>
                    
                    <div className="flex items-center space-x-1.5 text-xs mt-1" style={{ color: 'rgb(var(--text-muted))' }}>
                      <Calendar className="w-3.5 h-3.5 text-sunset-400" />
                      <span>{trip.duration.days} {t('history.days')} / {trip.duration.nights} {t('history.nights')}</span>
                    </div>

                    <p className="text-xs mt-4 line-clamp-2 leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>
                      {trip.generatedItinerary.tripSummary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgb(var(--border-color))', color: 'rgb(var(--text-muted))' }}>
                    <span>{t('history.createdOn')} {dateStr}</span>
                    <span className="text-ocean-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>{t('history.viewDetails')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl text-center max-w-xl mx-auto shadow-md">
          <div className="w-16 h-16 bg-gradient-to-tr from-sunset-500/10 to-gold-500/10 border border-sunset-500/20 rounded-2xl flex items-center justify-center text-sunset-400 mx-auto mb-6">
            <Compass className="w-8 h-8 animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('history.noItineraries')}</h2>
          <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'rgb(var(--text-muted))' }}>
            {searchQuery 
              ? t('history.noItinerariesSearch', { query: searchQuery })
              : t('history.noItinerariesEmpty')
            }
          </p>
          <Link to="/dashboard" className="btn-accent inline-flex items-center space-x-2 py-2.5 px-6 text-sm">
            <span>{t('history.planATrip')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
