import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AntiCheat from "@/components/anti-cheat";
import ScreenCapture from "@/components/screen-capture";
import { useToast } from "@/hooks/use-toast";
import CountdownTimer from "@/components/countdown-timer";
import { Loader2, Code2, Clock, LogOut, CheckCircle2, XCircle } from "lucide-react";
import CodeEditorWithSubmission from "@/components/CodeEditorWithSubmission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Codespace({ url }: { url: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <iframe
        src={url}
        width="100%"
        height="700"
        className="bg-gray-900 mt-8"
        title="Student Codespace"
      />
    </div>
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
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);

  const handleLaunchCodespace = async () => {
    setIsLoading(true);
    const res = await fetch("/api/container/spin-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: subject, userId: user?.id })
    });

    if (!res.ok) {
      const error = await res.json();
      toast({
        title: "Failed to launch codespace",
        description: error.message || "An error occurred while launching the codespace",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subject,
          questionId: question?.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit code");
      toast("Code submitted successfully!");
      setCode("");
    } catch (error) {
      toast("Failed to submit code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🕒 2-hour session auto-expiry
  useEffect(() => {
    const timeout = setTimeout(() => {
      toast("⏰ Session Expired. Your 2-hour session has ended.");
      logoutMutation.mutate(); // Force logout
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => clearTimeout(timeout);
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AntiCheat userId={user?.id} />
      <ScreenCapture userId={user?.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-400 mt-2 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
              Welcome back, {user?.email}
              </p>
            </div>
            <Button 
              onClick={() => logoutMutation.mutate()} 
              variant="outline"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <div className="max-w-3xl mx-auto bg-[#232946]/80 backdrop-blur-md rounded-xl shadow p-6 mb-8 border border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {question ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
                  <p className="text-gray-200 mb-2">{question.description}</p>
                  <span className="inline-block bg-blue-700/20 text-blue-200 font-semibold px-4 py-1 rounded-full text-xs tracking-wide shadow">
                    Time Limit: {question.timeLimit} min
                  </span>
                </div>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                  onClick={handleLaunchCodespace}
                  disabled={isLoading}
                >
                  {isLoading ? "Launching..." : "Launch Codespace"}
                </Button>
              </>
            ) : (
              <div className="text-gray-400">No question assigned yet.</div>
            )}
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-800/80 p-4 rounded-xl shadow-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <p className="text-sm font-medium text-gray-300">Session Timer</p>
                  </div>
                  <CountdownTimer 
                    initialTime={7200} 
                    className="text-3xl font-mono font-bold text-blue-400" 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-64">
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border-white-700">
                      <SelectItem value="javascript" className="text-gray-200 hover:bg-gray-700 hover:text-white">JavaScript</SelectItem>
                      <SelectItem value="python" className="text-gray-200 hover:bg-gray-700 hover:text-white">Python</SelectItem>
                      <SelectItem value="java" className="text-gray-200 hover:bg-gray-700 hover:text-white">Java</SelectItem>
                      <SelectItem value="cpp" className="text-gray-200 hover:bg-gray-700 hover:text-white">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleLaunchCodespace} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    "Launch Codespace"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Only show Codespace, remove code editor tab */}
          <div className="mt-8">
            {codespaceUrl && (
              <>
                <div className="space-y-4">
                  <div className="bg-gray-800/80 rounded-xl border border-gray-700/50 p-4">
                    <Codespace url={codespaceUrl} />
                    <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 mt-4">
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="text-gray-400">Login credentials:</span>
                        <span className="font-mono bg-gray-900 px-3 py-1 rounded-lg border border-gray-700 text-blue-400">cs1234</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code submission box only visible when codespace is launched */}
                <div className="mt-10 w-full max-w-5xl mx-auto">
                  <div className="mb-4 text-lg text-gray-700 font-medium bg-white rounded-t-lg px-4 pt-4">Login password: <span className="font-mono">cs1234</span></div>
                  <textarea
                    className="w-full min-h-[250px] text-2xl font-mono text-gray-500 border border-gray-200 rounded-b-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-vertical bg-white"
                    placeholder="Paste your code here to submit"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !code.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
