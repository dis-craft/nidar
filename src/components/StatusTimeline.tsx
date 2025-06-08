import { motion } from 'framer-motion';

interface StatusTimelineProps {
  steps: string[];
  currentStep: number;
}

const StatusTimeline = ({ steps, currentStep }: StatusTimelineProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center space-x-3 ${
              index < currentStep ? 'text-green-600' : 
              index === currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              index < currentStep ? 'bg-green-100' :
              index === currentStep ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {index < currentStep ? '✓' : index === currentStep ? '→' : '○'}
            </div>
            <span className="text-sm">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline; 