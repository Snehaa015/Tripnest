import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItineraryById, shareItinerary } from '../services/itineraryService';
import { exportItineraryToPDF, exportPageToPDF } from '../utils/pdfExport';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Plane, 
  Hotel, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  Utensils, 
  Compass, 
  Briefcase, 
  ChevronDown, 
  ChevronUp,
  Globe,
  ArrowLeft,
  Sun,
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

const ItineraryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeDay, setActiveDay] = useState(1);
  const [expandedDays, setExpandedDays] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getItineraryById(id, i18n.language);
        if (response.success && response.data) {
          setItinerary(response.data);
          const defaultExpanded = {};
          response.data.generatedItinerary.dayWisePlan.forEach(d => {
            defaultExpanded[d.dayNumber] = true;
          });
          setExpandedDays(defaultExpanded);
        } else {
          throw new Error('Itinerary not found.');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load itinerary.');
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id, i18n.language]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse font-sans">
        <div className="h-72 bg-slate-900/50 rounded-3xl mb-8 border border-white/5"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 bg-slate-900/50 rounded-xl w-1/3"></div>
            <div className="h-48 bg-slate-900/50 rounded-2xl"></div>
            <div className="h-48 bg-slate-900/50 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-36 bg-slate-900/50 rounded-2xl"></div>
            <div className="h-56 bg-slate-900/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="max-w-md mx-auto text-center py-20 font-sans">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-4 border border-rose-500/20">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Trip Not Found</h2>
        <p className="text-slate-450 mb-6">{error || 'This itinerary does not exist.'}</p>
        <button onClick={() => navigate('/history')} className="btn-primary">
          Back to Journeys
        </button>
      </div>
    );
  }

  const { extractedData, generatedItinerary, destinationImage, shareId, isPublic, duration } = itinerary;

  const handleShareToggle = async () => {
    setSharing(true);
    try {
      const response = await shareItinerary(itinerary._id);
      if (response.success) {
        setItinerary(prev => ({
          ...prev,
          isPublic: response.data.isPublic
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDayExpansion = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  return (
    <div id="itinerary-content" className="max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Back to history */}
      <button 
        onClick={() => navigate('/history')} 
        className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-sm mb-6 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-white/5"
      >
        <ArrowLeft className="w-4 h-4 text-ocean-400" />
        <span className="font-semibold">{t('itinerary.backToJourneys')}</span>
      </button>


      {/* Luxury Cover Header */}
      <div className="relative h-[40vh] sm:h-[48vh] rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-2xl group">
        <img 
          src={destinationImage} 
          alt={extractedData.destination} 
          className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent"></div>
        
        {/* Destination Details overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sunset-500/20 border border-sunset-500/30 text-sunset-355 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>{t('itinerary.journeyDetails')}</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {extractedData.destination}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300 font-semibold">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-sunset-400" />
                <span>{duration.days} {t('dashboard.days')} / {duration.nights} {t('dashboard.nights')}</span>
              </span>
              {extractedData.hotelName && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center space-x-1">
                    <Hotel className="w-4 h-4 text-emerald-400" />
                    <span className="max-w-[200px] truncate">{extractedData.hotelName}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                setPdfLoading(true);
                try {
                  const dest = itinerary.extractedData.destination.replace(/[^a-zA-Z0-9]/g, '_');
                  await exportPageToPDF('itinerary-content', `${dest}_itinerary.pdf`);
                } catch (e) {
                  // Fallback to the text-based PDF if html2canvas fails
                  exportItineraryToPDF(itinerary);
                } finally {
                  setPdfLoading(false);
                }
              }}
              disabled={pdfLoading}
              className="btn-accent py-2.5 px-6 flex items-center space-x-1.5 text-sm"
            >
              {pdfLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Download className="w-4.5 h-4.5" />
              )}
              <span>{t('itinerary.downloadPDF')}</span>
            </button>
            
            <button
              onClick={handleShareToggle}
              disabled={sharing}
              className={`flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 border text-sm ${
                isPublic 
                  ? 'bg-sunset-500/10 border-sunset-500/35 text-sunset-450' 
                  : 'glass border-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Share2 className="w-4.5 h-4.5" />
              <span>{isPublic ? t('itinerary.sharedPublicly') : t('itinerary.shareTrip')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shared URL Center */}
      {isPublic && (
        <div className="mb-8 p-4.5 rounded-2xl glass-card border border-sunset-500/20 bg-sunset-500/5 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-slate-205 text-sm">
            <div className="p-2.5 rounded-xl bg-sunset-500/10 text-sunset-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sunset-300">{t('itinerary.publicLinkActive')}</p>
              <p className="text-xs text-slate-400">{t('itinerary.publicLinkDesc')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/share/${shareId}`}
              className="px-3 py-2 rounded-xl glass-input text-xs w-full sm:w-72 bg-slate-950 border border-slate-900 font-mono"
            />
            <button
              onClick={copyShareLink}
              className="btn-primary py-2 px-4 text-xs flex items-center space-x-1 flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('itinerary.copied') : t('itinerary.copy')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Visual Timeline (Left) & Info Boxes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Schedule Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Box */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-3">{t('itinerary.aboutTrip')}</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {generatedItinerary.tripSummary}
            </p>
          </div>

          {/* Visual Travel Timeline */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5.5 h-5.5 text-ocean-400 animate-spin" style={{ animationDuration: '20s' }} />
                <span>{t('itinerary.timelineTitle')}</span>
              </h2>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{duration.days} {t('itinerary.daysPlanned')}</span>
            </div>

            {generatedItinerary.dayWisePlan.map((day) => {
              const isExpanded = expandedDays[day.dayNumber];
              return (
                <div 
                  key={day.dayNumber} 
                  className={`glass-card rounded-2xl overflow-hidden border border-white/5 ${
                    activeDay === day.dayNumber ? 'ring-1 ring-ocean-500/20' : ''
                  }`}
                  onClick={() => setActiveDay(day.dayNumber)}
                >
                  {/* Day header */}
                  <div 
                    onClick={() => toggleDayExpansion(day.dayNumber)}
                    className="p-5 sm:px-6 bg-slate-900/20 border-b border-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-900/40"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-ocean-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        D{day.dayNumber}
                      </div>
                      <div>
                        <span className="text-[10px] text-sunset-400 font-bold uppercase tracking-widest font-mono">{t('itinerary.daySchedule', { day: day.dayNumber })}</span>
                        <h3 className="text-base sm:text-lg font-bold text-white">{day.title}</h3>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Redesigned Visual Journey Path */}
                  {isExpanded && (
                    <div className="p-6 space-y-8 relative border-l-2 border-dashed border-ocean-500/20 ml-10 sm:ml-11 mt-4 mb-4">
                      {day.activities.map((act, idx) => {
                        const meta = getActivityVisualMeta(act.activity);
                        const Icon = meta.icon;
                        
                        return (
                          <div key={idx} className="relative pl-8 group animate-slide-up">
                            
                            {/* Visual Journey Node */}
                            <div className="absolute left-[-45px] top-0.5 w-7 h-7 rounded-full bg-slate-950 border-2 border-ocean-500/50 flex items-center justify-center text-ocean-400 group-hover:scale-110 transition-transform shadow-md shadow-ocean-950/20 z-10">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              {/* Travel Journey Tag */}
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${meta.color}`}>
                                {meta.label}
                              </span>

                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-md border border-white/5">
                                  <Clock className="w-3.5 h-3.5 text-ocean-400" />
                                  <span>{act.time || t('itinerary.flexible')}</span>
                                </span>
                                {act.cost && (
                                  <span className="inline-flex items-center space-x-1 text-xs text-slate-350 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
                                    <Coins className="w-3.5 h-3.5 text-gold-450" />
                                    <span>{act.cost}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-ocean-400 transition-colors">
                              {act.activity}
                            </h4>
                            
                            {act.description && (
                              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
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

        {/* Right Info widgets & recommendations */}
        <div className="space-y-6">
          
          {/* Booking Summary Box */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-sunset-400 animate-pulse" />
              <span>{t('itinerary.bookingSummary')}</span>
            </h3>

            <div className="space-y-4">
              {extractedData.flightNumber ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-ocean-400 font-semibold">
                    <Plane className="w-4.5 h-4.5" />
                    <span>{t('itinerary.flight')} {extractedData.flightNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t('itinerary.airlineLbl')} {extractedData.airline}</p>
                  <p className="text-xs text-slate-505 font-medium border-t border-slate-900 pt-2">
                    {extractedData.departureCity} ➔ {extractedData.arrivalCity}
                  </p>
                  <p className="text-[10px] text-slate-500">{t('itinerary.timeLbl')} {extractedData.departureDate}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">{t('itinerary.noFlights')}</p>
              )}

              {(extractedData.trainNumber || extractedData.trainName) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-amber-455 font-semibold">
                    <Train className="w-4.5 h-4.5 text-amber-400" />
                    <span>{t('itinerary.train')} {extractedData.trainNumber || 'N/A'}</span>
                  </div>
                  {extractedData.trainName && <p className="text-xs text-slate-300">{t('itinerary.nameLbl')} {extractedData.trainName}</p>}
                  <p className="text-xs text-slate-400 font-medium">{t('itinerary.operatorLbl')} {extractedData.operator || 'N/A'}</p>
                  <p className="text-xs text-slate-505 font-medium border-t border-slate-900 pt-2">
                    {extractedData.departureStation || 'N/A'} ➔ {extractedData.arrivalStation || 'N/A'}
                  </p>
                  {extractedData.departureTime && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.timeLbl')} {extractedData.departureTime} ➔ {extractedData.arrivalTime || 'N/A'}</p>
                  )}
                  {extractedData.seatInfo && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.seatClassLbl')} {extractedData.seatInfo} ({extractedData.coachClass || 'N/A'})</p>
                  )}
                  {extractedData.fareAmount && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.fareLbl')} {extractedData.fareAmount}</p>
                  )}
                </div>
              )}

              {(extractedData.busNumber || (extractedData.operator && !extractedData.trainNumber && !extractedData.flightNumber)) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                    <Bus className="w-4.5 h-4.5 text-sky-400" />
                    <span>{t('itinerary.bus')} {extractedData.busNumber || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{t('itinerary.operatorLbl')} {extractedData.operator || 'N/A'}</p>
                  <p className="text-xs text-slate-505 font-medium border-t border-slate-900 pt-2">
                    {extractedData.departureStation || 'N/A'} ➔ {extractedData.arrivalStation || 'N/A'}
                  </p>
                  {extractedData.departureTime && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.timeLbl')} {extractedData.departureTime} ➔ {extractedData.arrivalTime || 'N/A'}</p>
                  )}
                  {extractedData.seatInfo && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.seatClassLbl')} {extractedData.seatInfo}</p>
                  )}
                  {extractedData.fareAmount && (
                    <p className="text-[10px] text-slate-500">{t('itinerary.fareLbl')} {extractedData.fareAmount}</p>
                  )}
                </div>
              )}

              {extractedData.hotelName ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-emerald-450 font-semibold">
                    <Hotel className="w-4.5 h-4.5" />
                    <span className="truncate">{extractedData.hotelName}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{extractedData.hotelAddress}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                    <div>
                      <span>{t('itinerary.checkInLbl')}</span>
                      <p className="font-semibold text-slate-350">{extractedData.checkInDate}</p>
                    </div>
                    <div>
                      <span>{t('itinerary.checkOutLbl')}</span>
                      <p className="font-semibold text-slate-350">{extractedData.checkOutDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">{t('itinerary.noHotel')}</p>
              )}

              {extractedData.bookingReference && (
                <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-900 text-center font-semibold text-slate-300">
                  <span>{t('itinerary.pnrLbl')} </span>
                  <span className="font-mono text-sunset-400 uppercase">{extractedData.bookingReference}</span>
                </div>
              )}
            </div>
          </div>
               {/* Attractions Box */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sunset-400" />
              <span>{t('itinerary.mustVisit')}</span>
            </h3>
            <ul className="space-y-2.5">
              {generatedItinerary.attractions.map((attr, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-350 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                  <span className="w-2 h-2 rounded-full bg-sunset-500 mt-1.5 flex-shrink-0"></span>
                  <span>{attr}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Food Box */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-sunset-400" />
              <span>{t('itinerary.localCuisine')}</span>
            </h3>
            <ul className="space-y-2.5">
              {generatedItinerary.foodRecommendations.map((food, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-350 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                  <span className="w-2 h-2 rounded-full bg-sunset-500 mt-1.5 flex-shrink-0"></span>
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Packing checklist */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sunset-400" />
              <span>{t('itinerary.packingList')}</span>
            </h3>
            <ul className="space-y-2.5">
              {generatedItinerary.packingSuggestions.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-350 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                  <span className="w-2 h-2 rounded-full bg-sunset-500 mt-1.5 flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Travel Tips */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-sunset-400" />
              <span>{t('itinerary.tips')}</span>
            </h3>
            <ul className="space-y-2.5">
              {generatedItinerary.travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-305 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60">
                  <span className="w-2 h-2 rounded-full bg-sunset-500 mt-1.5 flex-shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ItineraryDetailPage;
