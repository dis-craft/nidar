import { motion } from 'framer-motion';

interface HeaderProps {
  isTestMode: boolean;
  setIsTestMode: (value: boolean) => void;
  activeDrone: 'scan' | 'spray';
}

const Header = ({ isTestMode, setIsTestMode, activeDrone }: HeaderProps) => {
  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <h1 className="text-xl font-bold text-gray-800">Precision Farming Dashboard</h1>
      </div>

      <div className="flex items-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTestMode(!isTestMode)}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            isTestMode ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          <span>{isTestMode ? '🧪' : '🚀'}</span>
          <span>{isTestMode ? 'Test Mode' : 'Live Mode'}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-2 rounded-full ${
            activeDrone === 'scan' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {activeDrone === 'scan' ? 'Scan Drone' : 'Spray Drone'}
        </motion.div>
      </div>
    </header>
  );
};

export default Header; 