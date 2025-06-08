import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionState } from './services/types';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import MapCanvas from './components/MapCanvas';
import ImageFeed from './components/ImageFeed';
import SpinnerOverlay from './components/SpinnerOverlay';

function App() {
  const [isTestMode, setIsTestMode] = useState(true);
  const [activeDrone, setActiveDrone] = useState<'scan' | 'spray'>('scan');
  const [isLoading, setIsLoading] = useState(true);
  const [missionState, setMissionState] = useState<MissionState>({
    mode: 'test',
    drone: 'scan',
    stream: []
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const missionRef = window.firebase.database().ref('missions/current');
    const unsubscribe = missionRef.on('value', (snapshot) => {
      const data = snapshot.val() as MissionState;
      if (data) {
        setMissionState(data);
        setActiveDrone(data.drone);
        if (data.stream.length > 0) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      missionRef.off('value', unsubscribe);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header 
        isTestMode={isTestMode} 
        setIsTestMode={setIsTestMode}
        activeDrone={activeDrone}
      />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-full md:w-80 bg-white shadow-lg flex flex-col"
        >
          <SidePanel 
            isTestMode={isTestMode}
            activeDrone={activeDrone}
            setActiveDrone={setActiveDrone}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            missionState={missionState}
          />
        </motion.div>
        
        <div className="flex-1 relative">
          <MapCanvas 
            isTestMode={isTestMode}
            activeDrone={activeDrone}
            stream={missionState.stream}
          />
          <AnimatePresence>
            {missionState.stream.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="absolute bottom-0 left-0 right-0"
              >
                <ImageFeed images={missionState.stream} />
              </motion.div>
            )}
          </AnimatePresence>
          {isLoading && <SpinnerOverlay />}
        </div>
      </div>
    </div>
  );
}

export default App; 