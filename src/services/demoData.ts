import { StreamPoint, MissionState } from './types';
import { database } from './firebase';

export interface StreamPoint {
  timestamp: number;
  lat: number;
  lng: number;
  stressScore: number;
  imageUrl: string;
}

export interface MissionState {
  mode: 'test' | 'live';
  drone: 'scan' | 'spray';
  stream: StreamPoint[];
  status?: string;
}

// Demo coordinates around a central point
const generateDemoPoints = (centerLat: number, centerLng: number, count: number): StreamPoint[] => {
  const points: StreamPoint[] = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const latStep = 0.0001; // Approximately 11 meters
  const lngStep = 0.0001;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const lat = centerLat + (row - gridSize/2) * latStep;
    const lng = centerLng + (col - gridSize/2) * lngStep;
    
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

// Demo spray path points
const generateSprayPath = (points: StreamPoint[]): StreamPoint[] => {
  return points
    .filter(point => point.stressScore > 0.5)
    .map(point => ({
      ...point,
      timestamp: point.timestamp + 5000, // 5 seconds after scan
      stressScore: 0.1 // Reset stress score after spraying
    }));
};

let demoInterval: number | null = null;
let currentIndex = 0;
let scanPoints: StreamPoint[] = [];
let sprayPoints: StreamPoint[] = [];

export const startDemoStream = (centerLat: number, centerLng: number) => {
  const missionRef = database.ref('missions/current');
  
  // Reset state
  currentIndex = 0;
  scanPoints = generateDemoPoints(centerLat, centerLng, 50);
  sprayPoints = generateSprayPath(scanPoints);
  
  // Initial state
  const initialState: MissionState = {
    mode: 'test',
    drone: 'scan',
    stream: [],
    status: 'Starting scan mission...'
  };
  
  missionRef.set(initialState);

  // Stream points every 500ms
  demoInterval = window.setInterval(() => {
    if (currentIndex < scanPoints.length) {
      // Scanning phase
      const currentPoint = scanPoints[currentIndex];
      missionRef.set({
        mode: 'test',
        drone: 'scan',
        stream: scanPoints.slice(0, currentIndex + 1),
        status: `Scanning point ${currentIndex + 1}/${scanPoints.length}`
      });
      currentIndex++;
    } else if (currentIndex === scanPoints.length) {
      // Transition to spraying
      missionRef.set({
        mode: 'test',
        drone: 'spray',
        stream: scanPoints,
        status: 'Scan complete. Preparing for spray mission...'
      });
      currentIndex++;
    } else if (currentIndex < scanPoints.length + sprayPoints.length + 1) {
      // Spraying phase
      const sprayIndex = currentIndex - scanPoints.length - 1;
      if (sprayIndex < sprayPoints.length) {
        missionRef.set({
          mode: 'test',
          drone: 'spray',
          stream: [...scanPoints, ...sprayPoints.slice(0, sprayIndex + 1)],
          status: `Spraying point ${sprayIndex + 1}/${sprayPoints.length}`
        });
      }
      currentIndex++;
    } else {
      // Mission complete
      missionRef.set({
        mode: 'test',
        drone: 'scan',
        stream: [...scanPoints, ...sprayPoints],
        status: 'Mission complete! All areas treated.'
      });
      stopDemoStream();
    }
  }, 500);
};

export const stopDemoStream = () => {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
};

export const resetDemoStream = () => {
  stopDemoStream();
  const missionRef = database.ref('missions/current');
  missionRef.set({
    mode: 'test',
    drone: 'scan',
    stream: [],
    status: 'Mission reset'
  });
}; 