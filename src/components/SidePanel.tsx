import { motion } from 'framer-motion';
import { startDemoStream, stopDemoStream, resetDemoStream } from '../services/demoData';
import StatusTimeline from './StatusTimeline';
import LiveLog from './LiveLog';
import { MissionState } from '../services/types';

interface SidePanelProps {
  isTestMode: boolean;
  activeDrone: 'scan' | 'spray';
  setActiveDrone: (drone: 'scan' | 'spray') => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  missionState: MissionState;
}

const SidePanel = ({ 
  isTestMode, 
  activeDrone, 
  setActiveDrone,
  isPaused,
  setIsPaused,
  missionState 
}: SidePanelProps) => {
  const steps = [
    'Connect to Scan Drone',
    'Receive Multispectral Frames',
    'Run ML Stress Detection',
    'Plot Geo-tags on Map',
    'Switch to Spray Drone',
    'Execute Spray Mission'
  ];

  const handleStart = () => {
    if (isTestMode) {
      startDemoStream(12.35, 78.91);
    }
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isTestMode) {
      stopDemoStream();
    }
    setIsPaused(true);
  };

  const handleReset = () => {
    if (isTestMode) {
      resetDemoStream();
    }
    setIsPaused(false);
  };

  const getCurrentStep = () => {
    if (missionState.stream.length === 0) return 0;
    if (activeDrone === 'spray') return 5;
    return Math.min(4, Math.floor(missionState.stream.length / 5));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Mission Controls</h2>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={!isPaused && missionState.stream.length > 0}
            className={`flex-1 bg-green-500 text-white px-4 py-2 rounded ${
              !isPaused && missionState.stream.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ▶️ Start
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            disabled={isPaused || missionState.stream.length === 0}
            className={`flex-1 bg-yellow-500 text-white px-4 py-2 rounded ${
              isPaused || missionState.stream.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ⏸ Pause
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={missionState.stream.length === 0}
            className={`flex-1 bg-red-500 text-white px-4 py-2 rounded ${
              missionState.stream.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            🔄 Reset
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <StatusTimeline steps={steps} currentStep={getCurrentStep()} />
        <LiveLog stream={missionState.stream} />
      </div>
    </div>
  );
};

export default SidePanel; 