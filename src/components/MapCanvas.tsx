import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Polygon, useMap, Rectangle, ZoomControl, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import { StreamPoint } from '../services/demoData';

interface MapCanvasProps {
  isTestMode: boolean;
  activeDrone: 'scan' | 'spray';
  stream: StreamPoint[];
  missionStarted: boolean;
  statusMessage: string;
}

// Hoskote coordinates (approximately)
const HOSKOTE_CENTER = [13.0707, 77.7982];

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
const MapController = ({ activeDrone }: { activeDrone: 'scan' | 'spray' }) => {
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

  const scanPoints = stream.filter(point => point.stressScore <= 0.5);
  const sprayPoints = stream.filter(point => point.stressScore > 0.5);

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
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Handle point selection
  const handlePointClick = (point: StreamPoint) => {
    setCurrentPoint(point);
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
        
        <MapController activeDrone={activeDrone} />
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
            {isTestMode && stream.map((point, index) => (
              <CircleMarker
                key={point.timestamp}
                center={[point.lat, point.lng]}
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
          </>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
          <h3 className="font-bold mb-2">Stress Levels</h3>
          {Object.values(STRESS_LEVELS).map((level, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
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
    </div>
  );
};

export default MapCanvas; 