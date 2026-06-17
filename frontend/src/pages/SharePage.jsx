import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicItinerary } from '../services/itineraryService';
import { exportItineraryToPDF, exportPageToPDF } from '../utils/pdfExport';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Plane, 
  Hotel, 
  Download, 
  Clock, 
  Utensils, 
  Compass, 
  Briefcase, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Copy,
  Check,
  Sunset,
  Info,
  Coins,
  Train,
  Bus
} from 'lucide-react';

const getActivityVisualMeta = (activityName) => {
  const name = activityName.toLowerCase();
  if (name.includes('flight') || name.includes('depart') || name.includes('arrive') || name.includes('airport') || name.includes('boarding') || name.includes('transfer')) {
    return { icon: Plane, label: '✈ Flight Logistics / Departure', color: 'text-ocean-400 bg-ocean-500/10 border-ocean-500/20' };
  }
  if (name.includes('hotel') || name.includes('check-in') || name.includes('check in') || name.includes('resort') || name.includes('room') || name.includes('lodging')) {
    return { icon: Hotel, label: '🏨 Accommodation / Check-in', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  }
  if (name.includes('train') || name.includes('rail') || name.includes('station') || name.includes('express') || name.includes('berth') || name.includes('coach')) {
    return { icon: Train, label: '🚆 Train Travel / Rail', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  }
  if (name.includes('bus') || name.includes('shuttle') || name.includes('transit') || name.includes('stop')) {
    return { icon: Bus, label: '🚌 Bus Transit / Coach', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
  }
  if (name.includes('dinner') || name.includes('lunch') || name.includes('breakfast') || name.includes('cafe') || name.includes('restaurant') || name.includes('food') || name.includes('dining') || name.includes('eat')) {
    return { icon: Utensils, label: '🍽 Dining / Restaurant', color: 'text-sunset-400 bg-sunset-500/10 border-sunset-500/20' };
  }
  if (name.includes('evening') || name.includes('night') || name.includes('bar') || name.includes('sunset') || name.includes('club') || name.includes('pub') || name.includes('lounge')) {
    return { icon: Sunset, label: '🌅 Evening Activity / Nightlife', color: 'text-gold-450 bg-gold-500/10 border-gold-500/20' };
  }
  return { icon: Compass, label: '🏝 Attraction / Exploration', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
};

const SharePage = () => {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchPublicTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPublicItinerary(shareId, i18n.language);
        if (response.success && response.data) {
          setItinerary(response.data);
          const defaultExpanded = {};
          response.data.generatedItinerary.dayWisePlan.forEach(d => {
            defaultExpanded[d.dayNumber] = true;
          });
          setExpandedDays(defaultExpanded);
        } else {
          throw new Error('Itinerary not found');
        }
      } catch (err) {
        console.error(err);
        setError('Itinerary not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [shareId, i18n.language]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDayExpansion = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-ocean-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-ocean-400 font-medium animate-pulse">{t('review.generatingTitle')}...</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 font-sans text-center">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-455 mb-4 border border-rose-500/20">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">{t('itinerary.tripNotFound')}</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          {t('share.notFound')}
        </p>
        <Link to="/" className="btn-primary text-sm">
          {t('share.backToHome')}
        </Link>
      </div>
    );
  }

  const { extractedData, generatedItinerary, destinationImage, duration } = itinerary;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 flex flex-col relative">
      
      {/* Mini Brand Header */}
      <header className="glass border-b border-white/5 py-4 mb-8 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-ocean-500 to-emerald-500">
              <Compass className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-ocean-400 to-teal-200 bg-clip-text text-transparent">
              TripNest
            </span>
          </Link>
          <Link to="/register" className="btn-accent py-1.5 px-4 text-xs">
            {t('nav.getStarted')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="itinerary-content" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        
        {/* Banner */}
        <div className="relative h-64 sm:h-80 md:h-[40vh] rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-xl">
          <img 
            src={destinationImage} 
            alt={extractedData.destination} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-sunset-500/25 border border-sunset-500/30 text-sunset-300 text-xs font-semibold mb-3">
                <Globe className="w-3.5 h-3.5" />
                <span>{t('itinerary.sharedPublicly')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                {extractedData.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-350 font-medium">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-sunset-400" />
                  <span>{duration.days} {t('dashboard.days')} / {duration.nights} {t('dashboard.nights')}</span>
                </span>
                {extractedData.hotelName && (
                  <>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="flex items-center space-x-1">
                      <Hotel className="w-4 h-4 text-emerald-400" />
                      <span className="max-w-[200px] truncate">{extractedData.hotelName}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={copyLink}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border-white/5 text-slate-300 hover:text-white transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('itinerary.copied') : t('itinerary.shareTrip')}</span>
              </button>

              <button
                onClick={async () => {
                  setPdfLoading(true);
                  try {
                    const dest = itinerary.extractedData.destination.replace(/[^a-zA-Z0-9]/g, '_');
                    await exportPageToPDF('itinerary-content', `${dest}_itinerary.pdf`);
                  } catch (e) {
                    exportItineraryToPDF(itinerary);
                  } finally {
                    setPdfLoading(false);
                  }
                }}
                disabled={pdfLoading}
                className="btn-accent py-2 px-5 text-sm flex items-center space-x-1.5"
              >
                {pdfLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Download className="w-4.5 h-4.5" />
                )}
                <span>{t('itinerary.downloadPDF')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
              <h2 className="text-xl font-bold text-white mb-3">{t('itinerary.aboutTrip')}</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {generatedItinerary.tripSummary}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Compass className="w-5.5 h-5.5 text-ocean-400" />
                <span>{t('itinerary.timelineTitle')}</span>
              </h2>

              {generatedItinerary.dayWisePlan.map((day) => {
                const isExpanded = expandedDays[day.dayNumber];
                return (
                  <div key={day.dayNumber} className="glass-card rounded-2xl overflow-hidden border border-white/5">
                    <div 
                      onClick={() => toggleDayExpansion(day.dayNumber)}
                      className="p-5 sm:px-6 bg-slate-900/20 border-b border-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-900/40"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm border border-white/5">
                          D{day.dayNumber}
                        </div>
                        <div>
                          <span className="text-xs text-slate-405 font-bold uppercase tracking-widest font-mono">{t('itinerary.daySchedule', { day: day.dayNumber })}</span>
                          <h3 className="text-base sm:text-lg font-bold text-white">{day.title}</h3>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 sm:p-6 space-y-6 border-l-2 border-dashed border-ocean-500/20 ml-10 sm:ml-11 mt-4 mb-4">
                        {day.activities.map((act, idx) => {
                          const meta = getActivityVisualMeta(act.activity);
                          const Icon = meta.icon;
                          
                          return (
                            <div key={idx} className="relative pl-8 group">
                              <div className="absolute left-[-45px] top-0.5 w-7 h-7 rounded-full bg-slate-950 border-2 border-ocean-500/50 flex items-center justify-center text-ocean-450 z-10">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.color}`}>
                                  {meta.label}
                                </span>

                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-350 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                                    <Clock className="w-3.5 h-3.5 text-ocean-450" />
                                    <span>{act.time || t('itinerary.flexible')}</span>
                                  </span>
                                  {act.cost && (
                                    <span className="inline-flex items-center space-x-1 text-xs text-slate-350 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                                      <Coins className="w-3.5 h-3.5 text-gold-450" />
                                      <span>{act.cost}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className="text-sm sm:text-base font-bold text-slate-200 mb-1">
                                {act.activity}
                              </h4>
                              
                              {act.description && (
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                  {act.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right widgets */}
          <div className="space-y-6">
            
            {/* Flight & Hotel */}
            {(extractedData.flightNumber || extractedData.hotelName || extractedData.trainNumber || extractedData.trainName || extractedData.busNumber || extractedData.operator) && (
              <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
                <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2">
                  {t('share.bookingSummary')}
                </h3>
                <div className="space-y-4">
                  {(extractedData.trainNumber || extractedData.trainName) && (
                    <div className="flex items-start space-x-3 text-sm">
                      <Train className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-200">{t('itinerary.train')} {extractedData.trainNumber || 'N/A'}</h4>
                        {extractedData.trainName && <p className="text-xs text-slate-305">{t('itinerary.nameLbl')} {extractedData.trainName}</p>}
                        <p className="text-xs text-slate-450">{t('itinerary.operatorLbl')} {extractedData.operator || 'N/A'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {extractedData.departureStation || 'N/A'} ➔ {extractedData.arrivalStation || 'N/A'}
                        </p>
                        {extractedData.departureTime && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{t('itinerary.timeLbl')} {extractedData.departureTime} ➔ {extractedData.arrivalTime || 'N/A'}</p>
                        )}
                        {extractedData.seatInfo && (
                          <p className="text-[10px] text-slate-500">{t('itinerary.seatClassLbl')} {extractedData.seatInfo} ({extractedData.coachClass || 'N/A'})</p>
                        )}
                        {extractedData.fareAmount && (
                          <p className="text-[10px] text-slate-500">{t('itinerary.fareLbl')} {extractedData.fareAmount}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {(extractedData.busNumber || (extractedData.operator && !extractedData.trainNumber && !extractedData.flightNumber)) && (
                    <div className="flex items-start space-x-3 text-sm pt-2 border-t border-slate-900">
                      <Bus className="w-5 h-5 text-sky-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-200">{t('itinerary.bus')} {extractedData.busNumber || 'N/A'}</h4>
                        <p className="text-xs text-slate-450">{t('itinerary.operatorLbl')} {extractedData.operator || 'N/A'}</p>
                        <p className="text-xs text-slate-550 mt-1">
                          {extractedData.departureStation || 'N/A'} ➔ {extractedData.arrivalStation || 'N/A'}
                        </p>
                        {extractedData.departureTime && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{t('itinerary.timeLbl')} {extractedData.departureTime} ➔ {extractedData.arrivalTime || 'N/A'}</p>
                        )}
                        {extractedData.seatInfo && (
                          <p className="text-[10px] text-slate-550">{t('itinerary.seatClassLbl')} {extractedData.seatInfo}</p>
                        )}
                        {extractedData.fareAmount && (
                          <p className="text-[10px] text-slate-550">{t('itinerary.fareLbl')} {extractedData.fareAmount}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {extractedData.flightNumber && (
                    <div className="flex items-start space-x-3 text-sm pt-2 border-t border-slate-900">
                      <Plane className="w-5 h-5 text-ocean-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-200">{t('itinerary.flight')} {extractedData.flightNumber}</h4>
                        <p className="text-xs text-slate-450">{extractedData.airline}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {extractedData.departureCity} ➔ {extractedData.arrivalCity}
                        </p>
                      </div>
                    </div>
                  )}

                  {extractedData.hotelName && (
                    <div className="flex items-start space-x-3 text-sm pt-2 border-t border-slate-900">
                      <Hotel className="w-5 h-5 text-emerald-455 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-205">{extractedData.hotelName}</h4>
                        <p className="text-xs text-slate-450 truncate">{extractedData.hotelAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attractions */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sunset-400" />
                <span>{t('share.placesToExplore')}</span>
              </h3>
              <ul className="space-y-2.5">
                {generatedItinerary.attractions.map((attr, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-350 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-sunset-500 mt-2 flex-shrink-0"></span>
                    <span>{attr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Food Recommendations */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-sunset-400" />
                <span>{t('share.foodDining')}</span>
              </h3>
              <ul className="space-y-2.5">
                {generatedItinerary.foodRecommendations.map((food, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-350 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-sunset-500 mt-2 flex-shrink-0"></span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Packing */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sunset-400" />
                <span>{t('share.packingChecklist')}</span>
              </h3>
              <ul className="space-y-2.5">
                {generatedItinerary.packingSuggestions.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-355 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-sunset-500 mt-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Travel Tips */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-sunset-400" />
                <span>{t('share.travelTips')}</span>
              </h3>
              <ul className="space-y-2.5">
                {generatedItinerary.travelTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-slate-355 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-sunset-500 mt-2 flex-shrink-0"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </main>

      <footer className="border-t border-white/5 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-12">
        <p>{t('share.footer')}</p>
      </footer>
    </div>
  );
};

export default SharePage;
