// src/App.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from './services/firebase';
import { MissionState } from './services/types';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import MapCanvas from './components/MapCanvas';
import ImageFeed from './components/ImageFeed';
import SpinnerOverlay from './components/SpinnerOverlay';

// Add Firebase types
declare global {
  interface Window {
    firebase: any;
  }
}

interface DataSnapshot {
  val(): any;
  exists(): boolean;
  key: string | null;
}

function App() {
  const [isTestMode, setIsTestMode] = useState(true);
  const [activeDrone, setActiveDrone] = useState<'scan' | 'spray'>('scan');
  const [isLoading, setIsLoading] = useState(true);
  const [missionState, setMissionState] = useState<MissionState>({
    mode: 'test',
    drone: 'scan',
    stream: [],
    status: ''
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Create a reference to /missions/current using the CDN version
    const missionRef = database.ref('missions/current');

    // Subscribe
    const unsubscribe = missionRef.on('value', (snapshot: DataSnapshot) => {
      const data = snapshot.val() as MissionState | null;
      if (data) {
        setMissionState({
          mode: data.mode || 'test',
          drone: data.drone || 'scan',
          stream: data.stream || [],
          status: data.status || ''
        });
        setActiveDrone(data.drone || 'scan');
        if (data.stream && data.stream.length > 0) {
          setIsLoading(false);
        }
      }
    });

    // Cleanup
    return () => {
      missionRef.off('value', unsubscribe);
    };
  }, []);

  const missionStarted = missionState.stream && missionState.stream.length > 0;
  const statusMessage = missionState.status || '';

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
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            missionState={missionState}
          />
        </motion.div>
        
        <div className="flex-1 relative min-h-[400px] min-w-[300px]">
          <MapCanvas
            isTestMode={isTestMode}
            activeDrone={activeDrone}
            stream={missionState.stream || []}
            missionStarted={missionStarted}
            statusMessage={statusMessage}
          />
          <AnimatePresence>
            {missionState.stream && missionState.stream.length > 0 && (
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
