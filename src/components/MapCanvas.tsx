import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { StreamPoint } from '../services/demoData';

interface MapCanvasProps {
  isTestMode: boolean;
  activeDrone: 'scan' | 'spray';
  stream: StreamPoint[];
}

// Component to handle map zoom changes
const MapController = ({ activeDrone }: { activeDrone: 'scan' | 'spray' }) => {
  const map = useMap();

  useEffect(() => {
    if (activeDrone === 'spray') {
      map.setZoom(14);
    } else {
      map.setZoom(15);
    }
  }, [activeDrone, map]);

  return null;
};

const MapCanvas = ({ isTestMode, activeDrone, stream }: MapCanvasProps) => {
  const mapRef = useRef(null);

  const getStressColor = (score: number) => {
    if (score > 0.7) return '#ef4444'; // stress-red
    if (score > 0.3) return '#f97316'; // stress-orange
    return '#22c55e'; // stress-green
  };

  const scanPoints = stream.filter(point => point.stressScore <= 0.5);
  const sprayPoints = stream.filter(point => point.stressScore > 0.5);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[12.35, 78.91]}
        zoom={15}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController activeDrone={activeDrone} />
        
        {activeDrone === 'scan' && scanPoints.map((point, index) => (
          <CircleMarker
            key={point.timestamp}
            center={[point.lat, point.lng]}
            radius={8}
            pathOptions={{
              color: getStressColor(point.stressScore),
              fillColor: getStressColor(point.stressScore),
              fillOpacity: 0.7,
            }}
          />
        ))}

        {activeDrone === 'spray' && (
          <>
            {scanPoints.map((point, index) => (
              <CircleMarker
                key={point.timestamp}
                center={[point.lat, point.lng]}
                radius={6}
                pathOptions={{
                  color: getStressColor(point.stressScore),
                  fillColor: getStressColor(point.stressScore),
                  fillOpacity: 0.5,
                }}
              />
            ))}
            {sprayPoints.length > 0 && (
              <Polyline
                positions={sprayPoints.map(point => [point.lat, point.lng])}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 3,
                  dashArray: '10, 10',
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapCanvas; 