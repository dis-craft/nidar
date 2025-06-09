import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Polygon, useMap, Rectangle, ZoomControl, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds, LatLngTuple } from 'leaflet';
import { StreamPoint } from '../services/demoData';

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

const MapCanvas = ({ isTestMode, activeDrone, stream, missionStarted, statusMessage }: MapCanvasProps) => {
  const mapRef = useRef(null);
  const [selectedArea, setSelectedArea] = useState<LatLngBounds | null>(null);
  const [currentPoint, setCurrentPoint] = useState<StreamPoint | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [visiblePoints, setVisiblePoints] = useState<StreamPoint[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

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

  // Animate points appearance
  useEffect(() => {
    if (!missionStarted || stream.length === 0) return;

    const animatePoints = () => {
      if (animationFrame < stream.length) {
        setVisiblePoints(prev => [...prev, stream[animationFrame]]);
        setAnimationFrame(prev => prev + 1);
      }
    };

    const interval = setInterval(animatePoints, 500); // Adjust timing as needed
    return () => clearInterval(interval);
  }, [missionStarted, stream, animationFrame]);

  const scanPoints = visiblePoints.filter(point => point.stressScore <= 0.5);
  const sprayPoints = visiblePoints.filter(point => point.stressScore > 0.5);

  // Generate demo points within the plot bounds
  const generateDemoPoints = () => {
    const points: StreamPoint[] = [];
    const numPoints = 50;
    const gridSize = Math.ceil(Math.sqrt(numPoints));
    const latStep = (PLOT_BOUNDS.getNorth() - PLOT_BOUNDS.getSouth()) / gridSize;
    const lngStep = (PLOT_BOUNDS.getEast() - PLOT_BOUNDS.getWest()) / gridSize;

    for (let i = 0; i < numPoints; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const lat = PLOT_BOUNDS.getSouth() + (row + 0.5) * latStep;
      const lng = PLOT_BOUNDS.getWest() + (col + 0.5) * lngStep;
      
      points.push({
        timestamp: Date.now() + i * 1000,
        lat,
        lng,
        stressScore: Math.random(),
        imageUrl: `https://demo.storage/farm/image${i + 1}.png`
      });
    }
    return points;
  };

  const demoPoints = generateDemoPoints();

  // Show popup message
  const showStatusMessage = (message: string) => {
    // Implementation removed as it's not being used
  };

  // Handle point selection
  const handlePointClick = (point: StreamPoint) => {
    showStatusMessage(`Stress Level: ${getStressLabel(point.stressScore)}`);
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={HOSKOTE_CENTER}
        zoom={15}
        className="h-full w-full min-h-[400px] min-w-[300px] rounded-lg shadow-lg"
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
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold mb-2">2-Acre Plot</h3>
                  <p>Location: Hoskote</p>
                  <p>Area: 2 acres</p>
                </div>
              </Popup>
            </Rectangle>

            {/* Points */}
            {isTestMode && visiblePoints.map((point) => (
              <CircleMarker
                key={point.timestamp}
                center={[point.lat, point.lng] as LatLngTuple}
                radius={8}
                pathOptions={{
                  color: getStressColor(point.stressScore),
                  fillColor: getStressColor(point.stressScore),
                  fillOpacity: 0.7,
                }}
                eventHandlers={{
                  click: () => handlePointClick(point)
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
            
            {activeDrone === 'scan' && scanPoints.map((point) => (
              <CircleMarker
                key={point.timestamp}
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
                {scanPoints.map((point) => (
                  <CircleMarker
                    key={point.timestamp}
                    center={[point.lat, point.lng] as LatLngTuple}
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
                    positions={sprayPoints.map(point => [point.lat, point.lng] as LatLngTuple)}
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
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
          <h3 className="font-bold mb-2">Stress Levels</h3>
          {Object.values(STRESS_LEVELS).map((level) => (
            <div key={level.label} className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: level.color }}></div>
              <span className="text-sm">{level.label}</span>
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
            <span>{Math.round((visiblePoints.length / stream.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(visiblePoints.length / stream.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas; 