import { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialTime: number; // in seconds
  className?: string;
}

export default function CountdownTimer({ initialTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeLeft]);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  return (
    <div className={className}>
      {formatTime(timeLeft)}
    </div>
  );
}
