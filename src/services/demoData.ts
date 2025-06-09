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
}

// Demo coordinates around a central point
const generateDemoPoints = (centerLat: number, centerLng: number, count: number): StreamPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: Date.now() + i * 1000,
    lat: centerLat + (Math.random() - 0.5) * 0.01,
    lng: centerLng + (Math.random() - 0.5) * 0.01,
    stressScore: Math.random(),
    imageUrl: `https://demo.storage/farm/image${i + 1}.png`
  }));
};

// Demo spray path points
const generateSprayPath = (points: StreamPoint[]): StreamPoint[] => {
  return points.map(point => ({
    ...point,
    timestamp: point.timestamp + 5000, // 5 seconds after scan
    stressScore: point.stressScore > 0.5 ? 0.9 : 0.1 // High stress areas get sprayed
  }));
};

let demoInterval: number | null = null;

export const startDemoStream = (centerLat: number, centerLng: number) => {
  const missionRef = database.ref('missions/current');
  
  // Initial state
  const initialState: MissionState = {
    mode: 'test',
    drone: 'scan',
    stream: []
  };
  
  missionRef.set(initialState);

  // Generate initial points
  const scanPoints = generateDemoPoints(centerLat, centerLng, 20);
  const sprayPoints = generateSprayPath(scanPoints);
  
  let currentIndex = 0;
  
  // Stream points every 500ms
  demoInterval = window.setInterval(() => {
    if (currentIndex < scanPoints.length) {
      const currentPoint = scanPoints[currentIndex];
      missionRef.set({
        mode: 'test',
        drone: 'scan',
        stream: scanPoints.slice(0, currentIndex + 1)
      });
      currentIndex++;
    } else if (currentIndex < scanPoints.length + sprayPoints.length) {
      const sprayIndex = currentIndex - scanPoints.length;
      missionRef.set({
        mode: 'test',
        drone: 'spray',
        stream: [...scanPoints, ...sprayPoints.slice(0, sprayIndex + 1)]
      });
      currentIndex++;
    } else {
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
    stream: []
  });
}; 