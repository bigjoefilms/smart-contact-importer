import { useState, useEffect, useCallback } from 'react';

type AnimatedProgressBarProps = {
  autoStart?: boolean;
  durationMs?: number;
  onComplete?: () => void;
};

export default function AnimatedProgressBar({ autoStart = true, durationMs = 3000, onComplete }: AnimatedProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    setProgress(0);
    setIsAnimating(true);
    
    // Animate progress from 0 to 100%
    const duration = durationMs;
    const steps = 60; // 60 steps for smooth animation
    const increment = 100 / steps;
    const stepTime = duration / steps;
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setIsAnimating(false);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
      setProgress(currentProgress);
    }, stepTime);
  }, [durationMs, onComplete]);

  // Auto-start animation on component mount
  useEffect(() => {
    if (autoStart) startAnimation();
  }, [autoStart, startAnimation]);

  return (
    <div className="flex flex-col items-center justify-center mt-[24px]  bg-[#EEF4FF] h-[22px] rounded-[100px] max-w-[294px] w-full px-[8px] py-[7px
    ]  ">
      <div className="w-full max-w-md space-y-6  ">
        
        {/* Progress Bar Container */}
        <div className="w-full h-[8px] rounded-[100px] overflow-hidden bg-[#EEF4FF]" style={{ backgroundColor: '#EEF4FF' }}>
          <div 
            className="h-full rounded-lg transition-all duration-100 ease-out"
            style={{ 
              backgroundColor: '#5883C9',
              width: `${progress}%`
            }}
          />
        </div>
        
        
        
      </div>
    </div>
  );
}