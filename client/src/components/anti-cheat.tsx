import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AntiCheatProps {
  userId?: number;
}

export default function AntiCheat({ userId }: AntiCheatProps) {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!userId) return;
    
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Alert the user
        toast({
          title: "Tab switch detected!",
          description: "Switching tabs during the exam is not allowed and has been logged.",
          variant: "destructive",
        });
        
        // Log the event
        apiRequest("POST", "/api/log/tab-switch", { userId });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, toast]);
  
  return null; // This component doesn't render anything
}
