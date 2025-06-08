import { motion } from 'framer-motion';
import { StreamPoint } from '../services/demoData';

interface LiveLogProps {
  stream: StreamPoint[];
}

const LiveLog = ({ stream }: LiveLogProps) => {
  const getLogMessage = (point: StreamPoint, index: number): string => {
    const timestamp = new Date(point.timestamp).toLocaleTimeString();
    if (point.stressScore > 0.7) {
      return `[${timestamp}] High stress detected at point ${index + 1} (${point.stressScore.toFixed(2)})`;
    } else if (point.stressScore > 0.3) {
      return `[${timestamp}] Moderate stress detected at point ${index + 1} (${point.stressScore.toFixed(2)})`;
    }
    return `[${timestamp}] Healthy area detected at point ${index + 1} (${point.stressScore.toFixed(2)})`;
  };

  return (
    <div className="p-4 border-t">
      <h3 className="text-lg font-semibold mb-4">Live Log</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {stream.map((point, index) => (
          <motion.div
            key={point.timestamp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`text-sm p-2 rounded ${
              point.stressScore > 0.7 ? 'bg-red-50 text-red-700' :
              point.stressScore > 0.3 ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}
          >
            {getLogMessage(point, index)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveLog; 