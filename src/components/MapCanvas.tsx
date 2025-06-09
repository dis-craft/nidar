import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap, Rectangle, ZoomControl, Popup } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds, LatLngTuple } from 'leaflet';
import { StreamPoint } from '../services/demoData';
import './MapCanvas.css';

interface MapCanvasProps {
  isTestMode: boolean;
  activeDrone: 'scan' | 'spray';
  stream: StreamPoint[];
  missionStarted: boolean;
  statusMessage: string;
}

// Hoskote coordinates (approximately)
const HOSKOTE_CENTER: LatLngTuple = [13.0707, 77.7982];

// Calculate 2-acre plot bounds (1 acre ≈ 4046.86 square meters)
const ACRE_TO_METERS = 4046.86;
const TWO_ACRES_SIDE = Math.sqrt(ACRE_TO_METERS * 2);
const DEGREE_TO_METERS = 111320; // at the equator
const PLOT_SIDE_DEGREES = TWO_ACRES_SIDE / DEGREE_TO_METERS;

// Calculate plot bounds
const PLOT_BOUNDS: LatLngBounds = new LatLngBounds(
  [HOSKOTE_CENTER[0] - PLOT_SIDE_DEGREES/2, HOSKOTE_CENTER[1] - PLOT_SIDE_DEGREES/2],
  [HOSKOTE_CENTER[0] + PLOT_SIDE_DEGREES/2, HOSKOTE_CENTER[1] + PLOT_SIDE_DEGREES/2]
);

// Stress level ranges and colors
const STRESS_LEVELS = {
  HIGH: { min: 0.7, color: '#ef4444', label: 'High Stress (> 70%)' },
  MEDIUM: { min: 0.3, color: '#f97316', label: 'Medium Stress (30-70%)' },
  LOW: { min: 0, color: '#22c55e', label: 'Low Stress (< 30%)' }
};

// Component to handle map zoom changes
const MapController = () => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(PLOT_BOUNDS);
  }, [map]);

  return null;
};

// Helper to generate dummy heatmap points
const generateDummyHeatmapPoints = (bounds: LatLngBounds, count: number = 100) => {
  const points: { lat: number; lng: number; stressScore: number }[] = [];
  const latMin = bounds.getSouth();
  const latMax = bounds.getNorth();
  const lngMin = bounds.getWest();
  const lngMax = bounds.getEast();
  for (let i = 0; i < count; i++) {
    const lat = latMin + Math.random() * (latMax - latMin);
    const lng = lngMin + Math.random() * (lngMax - lngMin);
    const stressScore = Math.random();
    points.push({ lat, lng, stressScore });
  }
  return points;
};

// Helper to sort points left-to-right (by lng, then lat)
const sortPoints = (points: { lat: number; lng: number; stressScore: number; timestamp?: number }[]) => {
  return [...points].sort((a, b) => a.lng - b.lng || a.lat - b.lat);
};

const MapCanvas = ({ isTestMode, activeDrone, stream, missionStarted, statusMessage }: MapCanvasProps) => {
  const mapRef = useRef(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [sprayIndex, setSprayIndex] = useState(0);
  const [mode, setMode] = useState<'scan' | 'spray'>('scan');

  // Sort points for consistent scan/spray order
  const sortedPoints = sortPoints(stream);

  // Animate scan and spray progress
  useEffect(() => {
    if (!missionStarted || sortedPoints.length === 0) return;
    let interval: ReturnType<typeof setInterval>;
    if (activeDrone === 'scan') {
      setMode('scan');
      setSprayIndex(0);
      interval = setInterval(() => {
        setScanIndex((prev) => {
          if (prev < sortedPoints.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 300); // Adjust speed as needed
    } else if (activeDrone === 'spray') {
      setMode('spray');
      setScanIndex(sortedPoints.length);
      interval = setInterval(() => {
        setSprayIndex((prev) => {
          if (prev < sortedPoints.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 300); // Adjust speed as needed
    }
    return () => clearInterval(interval);
  }, [missionStarted, activeDrone, sortedPoints.length]);

  // Heatmap points logic
  let heatmapPoints: { lat: number; lng: number; stressScore: number; timestamp?: number }[] = [];
  if (mode === 'scan') {
    heatmapPoints = sortedPoints.slice(0, scanIndex);
  } else if (mode === 'spray') {
    heatmapPoints = sortedPoints.slice(sprayIndex);
  }

  const getStressColor = (score: number) => {
    if (score > STRESS_LEVELS.HIGH.min) return STRESS_LEVELS.HIGH.color;
    if (score > STRESS_LEVELS.MEDIUM.min) return STRESS_LEVELS.MEDIUM.color;
    return STRESS_LEVELS.LOW.color;
  };

  const getStressLabel = (score: number) => {
    if (score > STRESS_LEVELS.HIGH.min) return STRESS_LEVELS.HIGH.label;
    if (score > STRESS_LEVELS.MEDIUM.min) return STRESS_LEVELS.MEDIUM.label;
    return STRESS_LEVELS.LOW.label;
  };

  // Handle point selection
  const handlePointClick = () => {
    // Implementation removed as it's not being used
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={HOSKOTE_CENTER}
        zoom={15}
        className="h-[50vh] lg:h-full w-full min-h-[300px] min-w-[300px] rounded-lg shadow-lg"
        ref={mapRef}
        zoomControl={false}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController />
        <ZoomControl position="bottomright" />
        
        {/* Only show plot and points after mission starts */}
        {missionStarted && (
          <>
            {/* Plot boundary */}
            <Rectangle
              bounds={PLOT_BOUNDS}
              pathOptions={{
                color: '#ef4444',
                weight: 2,
                dashArray: '5, 5',
                fillOpacity: 0
              }}
            >
              <Popup className="custom-status-popup" offset={[0, -30]}>
                <div className="p-1 text-xs text-left max-w-[140px]">
                  <h3 className="font-bold mb-1 text-xs">2-Acre Plot</h3>
                  <p>Location: Hoskote</p>
                  <p>Area: 2 acres</p>
                </div>
              </Popup>
            </Rectangle>

            {/* Heatmap Layer */}
            <HeatmapLayer
              points={heatmapPoints}
              radius={20}
              blur={15}
              max={1}
              minOpacity={0.3}
            />

            {/* Points */}
            {isTestMode && sortedPoints.map((point, idx) => (
              <CircleMarker
                key={point.timestamp ?? `${point.lat},${point.lng},${idx}`}
                center={[point.lat, point.lng] as LatLngTuple}
                radius={8}
                pathOptions={{
                  color: getStressColor(point.stressScore),
                  fillColor: getStressColor(point.stressScore),
                  fillOpacity: 0.7,
                }}
                eventHandlers={{
                  click: () => handlePointClick()
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold mb-1">Scan Point</h3>
                    <p>Stress Level: {getStressLabel(point.stressScore)}</p>
                    <p>Coordinates: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            
            {activeDrone === 'scan' && sortedPoints.slice(0, scanIndex).map((point, idx) => (
              <CircleMarker
                key={point.timestamp ?? `${point.lat},${point.lng},${idx}`}
                center={[point.lat, point.lng] as LatLngTuple}
                radius={8}
                pathOptions={{
                  color: getStressColor(point.stressScore),
                  fillColor: getStressColor(point.stressScore),
                  fillOpacity: 0.7,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold mb-1">Scan Point</h3>
                    <p>Stress Level: {getStressLabel(point.stressScore)}</p>
                    <p>Coordinates: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {activeDrone === 'spray' && (
              <>
                {sortedPoints.slice(0, scanIndex).map((point, idx) => (
                  <CircleMarker
                    key={point.timestamp ?? `${point.lat},${point.lng},${idx}`}
                    center={[point.lat, point.lng] as LatLngTuple}
                    radius={6}
                    pathOptions={{
                      color: getStressColor(point.stressScore),
                      fillColor: getStressColor(point.stressScore),
                      fillOpacity: 0.5,
                    }}
                  />
                ))}
                {sortedPoints.slice(scanIndex).length > 0 && (
                  <Polyline
                    positions={sortedPoints.slice(scanIndex).map(point => [point.lat, point.lng] as LatLngTuple)}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 3,
                      dashArray: '10, 10',
                    }}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-[200px]">
          <h3 className="font-bold mb-2 text-sm lg:text-base">Stress Levels</h3>
          {Object.values(STRESS_LEVELS).map((level) => (
            <div key={level.label} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full" style={{ backgroundColor: level.color }}></div>
              <span className="text-xs lg:text-sm">{level.label}</span>
            </div>
          ))}
        </div>
      </MapContainer>

      {/* Centered status popup */}
      {statusMessage && (
        <div className="fixed left-1/2 top-20 transform -translate-x-1/2 bg-white px-6 py-4 rounded-xl shadow-2xl border border-gray-200 z-[2000] text-lg font-semibold animate-fade-in-out transition-all duration-500">
          {statusMessage}
        </div>
      )}

      {/* Progress indicator */}
      {missionStarted && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Scanning Progress</span>
            <span>{Math.round((scanIndex / sortedPoints.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(scanIndex / sortedPoints.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas; 