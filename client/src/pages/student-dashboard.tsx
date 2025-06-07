import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AntiCheat from "@/components/anti-cheat";
import ScreenCapture from "@/components/screen-capture";
import { useToast } from "@/hooks/use-toast";
import CountdownTimer from "@/components/countdown-timer";

function Codespace({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      width="100%"
      height="700"
      style={{ border: "1px solid #ccc", borderRadius: "8px" }}
      title="Student Codespace"
    />
  );
}

const waitForCodespace = (url: string, timeout = 15000) => {
  return new Promise<boolean>((resolve) => {
    const start = Date.now();
    let settled = false;

    async function tryLoad() {
      if (Date.now() - start > timeout) {
        if (!settled) {
          settled = true;
          resolve(false);
        }
        return;
      }

      try {
        await fetch(url, { mode: "no-cors" });
        if (!settled) {
          settled = true;
          resolve(true);
        }
      } catch (err) {
        setTimeout(tryLoad, 1000);
      }
    }

    tryLoad();
  });
};

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("javascript");
  const [codespaceUrl, setCodespaceUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunchCodespace = async () => {
    setIsLoading(true);
    const res = await fetch("/api/container/spin-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: subject, userId: user?.id })
    });

    const data = await res.json();
    const ready = await waitForCodespace(data.url);
    setIsLoading(false);

    if (ready) {
      setCodespaceUrl(data.url);
    } else {
      toast({
        title: "Codespace failed to start",
        description: "Timed out waiting for codespace to become available.",
        variant: "destructive",
      });
    }
  };

  // 🕒 20-minute session auto-expiry
  useEffect(() => {
    const timeout = setTimeout(() => {
      toast({
        title: "⏰ Session Expired",
        description: "Your 20-minute session has ended.",
        variant: "destructive"
      });

      logoutMutation.mutate(); // Force logout
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <AntiCheat userId={user?.id} />
      <ScreenCapture userId={user?.id} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <Button onClick={() => logoutMutation.mutate()} variant="outline">
          Logout
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center justify-end">
          <p className="mr-2 text-sm font-semibold text-gray-700">Session Timer:</p>
          <CountdownTimer initialTime={1200} className="text-lg font-mono text-red-600" />
        </div>

        <div className="w-64">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
        <SelectItem value="JavaScript">JavaScript</SelectItem>
<SelectItem value="Python">Python</SelectItem>
<SelectItem value="Java">Java</SelectItem>
<SelectItem value="C++">C++</SelectItem>
  </SelectContent>

          </Select>
        </div>

        <Button onClick={handleLaunchCodespace} disabled={isLoading}>
          {isLoading ? "Launching..." : "Launch Codespace"}
        </Button>
      </div>

      {codespaceUrl && (
        <div className="mb-8">
          <Codespace url={codespaceUrl} />
          <p className="text-xs mt-2 text-gray-600">
            Login password: <span className="font-mono">cs1234</span>
          </p>
        </div>
      )}
    </div>
  );
}
