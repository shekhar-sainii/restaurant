import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
  borderRadius: '1.5rem',
};

const LocationMap = ({ lat, lng, businessName }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const center = { lat: lat || 28.6139, lng: lng || 77.2090 };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyPlaceholder = !apiKey || apiKey === 'YOUR_DEMO_KEY_HERE';

  if (!isKeyPlaceholder && !isLoaded) return <div className="h-full w-full bg-white/5 animate-pulse rounded-3xl flex items-center justify-center text-text-muted">Loading Map...</div>;

  if (isKeyPlaceholder) {
    return (
      <div className="h-full min-h-[300px] w-full bg-amber-500/10 border border-amber-500/20 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
        <p className="text-amber-500 font-bold mb-2">Google Maps Key Missing</p>
        <p className="text-text-muted text-xs">Please add your API key to frontend/.env</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
          { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
          { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
          { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
        ]
      }}
    >
      <Marker position={center} title={businessName} />
    </GoogleMap>
  );
};

export default React.memo(LocationMap);
