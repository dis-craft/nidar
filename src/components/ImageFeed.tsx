import { motion } from 'framer-motion';
import { StreamPoint } from '../services/demoData';

interface ImageFeedProps {
  images: StreamPoint[];
}

const ImageFeed = ({ images }: ImageFeedProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {images.map((image) => (
          <motion.div
            key={image.timestamp}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <div 
                className="w-32 h-24 rounded-lg shadow-md flex items-center justify-center"
                style={{
                  backgroundColor: image.stressScore > 0.7 ? '#fee2e2' :
                                  image.stressScore > 0.3 ? '#ffedd5' : '#dcfce7'
                }}
              >
                <span className="text-sm font-medium">
                  {image.stressScore > 0.7 ? 'High Stress' :
                   image.stressScore > 0.3 ? 'Moderate' : 'Healthy'}
                </span>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {new Date(image.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImageFeed; 