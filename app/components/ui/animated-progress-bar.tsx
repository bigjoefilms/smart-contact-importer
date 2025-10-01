import { useState, useEffect, useCallback, useRef } from 'react';

type AnimatedProgressBarProps = {
  autoStart?: boolean;
  durationMs?: number;
  onComplete?: () => void;
};

export default function AnimatedProgressBar({ autoStart = true, durationMs = 3000, onComplete }: AnimatedProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // Easing function for smooth animation (ease-out)
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  const startAnimation = useCallback(() => {
    setProgress(0);
    setIsAnimating(true);
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      
      const elapsed = currentTime - startTimeRef.current;
      const rawProgress = Math.min(elapsed / durationMs, 1);
      
      // Apply easing function for smoother animation
      const easedProgress = easeOutQuart(rawProgress);
      const progressPercent = easedProgress * 100;
      
      setProgress(progressPercent);
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        startTimeRef.current = 0;
        if (onComplete) onComplete();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [durationMs, onComplete]);

  // Auto-start animation on component mount
  useEffect(() => {
    if (autoStart) startAnimation();
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoStart, startAnimation]);

  return (
    <div className="flex flex-col items-center justify-center mt-[24px]  bg-[#EEF4FF] h-[22px] rounded-[100px] max-w-[294px] w-full px-[8px] py-[7px
    ]  ">
      <div className="w-full max-w-md space-y-6  ">
        
        {/* Progress Bar Container */}
        <div className="w-full h-[8px] rounded-[100px] overflow-hidden bg-[#EEF4FF]" style={{ backgroundColor: '#EEF4FF' }}>
          <div 
            className="h-full rounded-lg"
            style={{ 
              backgroundColor: '#5883C9',
              width: `${progress}%`,
              transition: 'none' // Disable CSS transitions for smooth JS animation
            }}
          />
        </div>
        
        
        
      </div>
    </div>
  );
}