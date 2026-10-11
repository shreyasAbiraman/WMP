import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';
import { MapView } from '../components/map/MapView';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import {
  Compass,
  PhoneCall,
  Navigation2,
  MapPin,
  Shield,
  Building2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export const NearbyPlacesPage = () => {
  const { currentCoords, requestLocation } = useEmergency();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(5);

  useEffect(() => {
    loadPlaces();
  }, [radiusKm]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      let lat = currentCoords?.latitude || 19.076;
      let lng = currentCoords?.longitude || 72.8777;

      if (!currentCoords) {
        const coords = await requestLocation();
        if (coords) {
          lat = coords.latitude;
          lng = coords.longitude;
        }
      }

      const res = await api.get(`/places/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm * 1000}`);
      if (res?.success) {
        setPlaces(res.data.places || []);
      }
    } catch (err) {
      console.warn('Nearby places error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = places.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            <span>Nearby Help & Safe Places</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verified police stations, emergency hospitals, and women crisis intervention centers.
          </p>
        </div>

        {/* Radius filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Radius:</label>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none"
          >
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['all', 'police', 'hospital', 'women_help_center', 'pharmacy'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filterCategory === cat
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
        <MapView
          userLocation={currentCoords || { latitude: 19.076, longitude: 72.8777 }}
          places={filteredPlaces}
          className="h-80 w-full"
        />
      </div>

      {/* Places List */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Directory Results ({filteredPlaces.length} locations)
        </h2>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : filteredPlaces.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No facilities found in this radius.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{place.name}</h3>
                    <Badge variant={place.category === 'police' ? 'emergency' : 'primary'} className="capitalize flex-shrink-0">
                      {place.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {place.address || 'Verified Emergency Hub'}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>Distance: <strong>{place.distanceKm} km</strong></span>
                    <span>•</span>
                    <span>Hours: <strong>{place.openingHours}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone.split('/')[0].trim()}`}
                      className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {place.phone}</span>
                    </a>
                  ) : (
                    <a
                      href="tel:112"
                      className="flex items-center gap-1.5 font-bold text-red-600 hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 112</span>
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    <span>Directions</span>
                    <Navigation2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
