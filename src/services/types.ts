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