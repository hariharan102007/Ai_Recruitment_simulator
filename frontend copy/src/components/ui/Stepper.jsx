import { FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Stepper = ({ steps, currentStep = 0, orientation = 'vertical', className = '' }) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`${isVertical ? 'flex flex-col gap-0' : 'flex items-center gap-0'} ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <div key={index} className={`flex ${isVertical ? 'flex-row items-start' : 'flex-col items-center'} flex-1`}>
            <div className={`flex items-center ${isVertical ? 'flex-col items-center' : ''}`}>
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                  isActive ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' :
                  'border-white/20 text-gray-500 bg-white/5'
                }`}
              >
                {isCompleted ? <FiCheck className="w-4 h-4" /> : index + 1}
              </motion.div>
              <div className={`${isVertical ? 'ml-3 text-left' : 'mt-2 text-center'}`}>
                <p className={`text-sm font-medium ${isCompleted || isActive ? 'text-white' : 'text-gray-500'}`}>{step.name || step}</p>
                {step.description && <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`${isVertical ? 'w-0.5 h-8 ml-4 mt-1' : 'h-0.5 flex-1 mx-2'} ${index < currentStep ? 'bg-indigo-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
