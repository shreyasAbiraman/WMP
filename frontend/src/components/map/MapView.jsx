import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default marker icons broken by Vite bundlers
let DefaultIcon;
let SosIcon;
let SafePlaceIcon;

if (typeof window !== 'undefined' && L && L.icon) {
  try {
    DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    SosIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    SafePlaceIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    if (L.Marker && L.Marker.prototype) {
      L.Marker.prototype.options.icon = DefaultIcon;
    }
  } catch (e) {
    console.warn('Leaflet icon initialization notice:', e);
  }
}

// Recenter map controller
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export const MapView = ({
  center = [19.076, 72.8777],
  zoom = 14,
  userLocation = null,
  trail = [],
  places = [],
  destination = null,
  isEmergency = false,
  className = 'h-96 w-full',
}) => {
  const activeCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : center;

  const polylinePositions = trail
    .filter((pt) => pt.latitude && pt.longitude)
    .map((pt) => [pt.latitude, pt.longitude]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md ${className}`}>
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <RecenterAutomatically
            lat={userLocation.latitude}
            lng={userLocation.longitude}
          />
        )}

        {/* User Current Position */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={isEmergency ? SosIcon : DefaultIcon}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">
                    {isEmergency ? '🚨 SOS EMERGENCY LOCATION' : 'Your Current Location'}
                  </p>
                  <p className="text-slate-500">
                    Lat: {userLocation.latitude.toFixed(5)}, Lng: {userLocation.longitude.toFixed(5)}
                  </p>
                  {userLocation.accuracy && (
                    <p className="text-slate-400">Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                  )}
                </div>
              </Popup>
            </Marker>

            {userLocation.accuracy && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: isEmergency ? '#EF4444' : '#8B5CF6',
                  fillColor: isEmergency ? '#F87171' : '#C4B5FD',
                  fillOpacity: 0.15,
                }}
              />
            )}
          </>
        )}

        {/* Breadcrumb / Movement Trail */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: isEmergency ? '#DC2626' : '#7C3AED',
              weight: 4,
              opacity: 0.8,
              dashArray: isEmergency ? '6, 6' : undefined,
            }}
          />
        )}

        {/* Destination Marker */}
        {destination && destination.latitude && destination.longitude && (
          <Marker
            position={[destination.latitude, destination.longitude]}
            icon={SafePlaceIcon}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-emerald-700">🏁 Destination: {destination.name}</p>
                <p className="text-slate-500">{destination.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby safe places markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={place.category === 'police' ? SosIcon : SafePlaceIcon}
          >
            <Popup>
              <div className="text-xs max-w-xs">
                <p className="font-bold text-slate-900">{place.name}</p>
                <p className="text-slate-500 capitalize">{place.category.replace('_', ' ')} • {place.distanceKm} km away</p>
                {place.address && <p className="text-slate-400">{place.address}</p>}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="inline-block mt-1 font-semibold text-purple-600 hover:underline"
                  >
                    📞 Call: {place.phone}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
