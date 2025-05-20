import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { apiRequest } from "@/lib/queryClient";

interface ScreenCaptureProps {
  userId?: number;
  interval?: number; // in milliseconds
}

export default function ScreenCapture({ userId, interval = 30000 }: ScreenCaptureProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    // Function to capture the screen
    const captureScreen = async () => {
      try {
        // Target the editor element - in a real app we would capture the full screen
        const editorEl = document.getElementById("editor");
        if (!editorEl) return;
        
        const canvas = await html2canvas(editorEl);
        const image = canvas.toDataURL("image/png");
        
        // Send the screenshot to the server
        await apiRequest("POST", "/api/log/screenshot", { 
          userId, 
          image 
        });
      } catch (error) {
        console.error("Error capturing screen:", error);
      }
    };
    
    // Set up periodic screen capture
    intervalRef.current = setInterval(captureScreen, interval);
    
    // Capture initial screenshot
    captureScreen();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, interval]);
  
  return null; // This component doesn't render anything
}
