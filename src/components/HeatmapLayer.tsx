import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: { lat: number; lng: number; stressScore: number }[];
  radius?: number;
  blur?: number;
  max?: number;
  minOpacity?: number;
}

const HeatmapLayer = ({ points, radius = 20, blur = 15, max = 1, minOpacity = 0.3 }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // Convert points to [lat, lng, intensity]
    const heatData = points.map(p => [p.lat, p.lng, p.stressScore]);
    // @ts-ignore
    const heatLayer = L.heatLayer(heatData, { radius, blur, max, minOpacity });
    heatLayer.addTo(map);

    return () => {
      heatLayer.remove();
    };
    // eslint-disable-next-line
  }, [map, JSON.stringify(points), radius, blur, max, minOpacity]);

  return null;
};

export default HeatmapLayer; 