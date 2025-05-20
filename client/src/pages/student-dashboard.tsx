import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import MonacoEditor from "@/components/monaco-editor";
import CountdownTimer from "@/components/countdown-timer";
import AntiCheat from "@/components/anti-cheat";
import ScreenCapture from "@/components/screen-capture";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("javascript");
  const [code, setCode] = useState<string>(`function reverseString(str) {\n  // Your code here\n  \n  return str;\n}\n\n// Example test case\nconsole.log(reverseString("hello")); // should output: "olleh"`);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);
  
  // Simulate test cases for different languages
  const testCases: Record<string, Array<{ input: string; expected: string }>> = {
    javascript: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "", expected: "" },
      { input: "a", expected: "a" }
    ],
    python: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "", expected: "" },
      { input: "a", expected: "a" }
    ],
    java: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "", expected: "" },
      { input: "a", expected: "a" }
    ],
    cpp: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "", expected: "" },
      { input: "a", expected: "a" }
    ]
  };
  
  // Language-specific template code
  const templates: Record<string, string> = {
    javascript: `function reverseString(str) {\n  // Your code here\n  \n  return str;\n}\n\n// Example test case\nconsole.log(reverseString("hello")); // should output: "olleh"`,
    python: `def reverse_string(s):\n    # Your code here\n    \n    return s\n\n# Example test case\nprint(reverse_string("hello"))  # should output: "olleh"`,
    java: `public class Solution {\n    public static String reverseString(String str) {\n        // Your code here\n        \n        return str;\n    }\n    \n    public static void main(String[] args) {\n        // Example test case\n        System.out.println(reverseString("hello")); // should output: "olleh"\n    }\n}`,
    cpp: `#include <iostream>\n#include <string>\n\nstd::string reverseString(std::string str) {\n    // Your code here\n    \n    return str;\n}\n\nint main() {\n    // Example test case\n    std::cout << reverseString("hello") << std::endl; // should output: "olleh"\n    return 0;\n}`
  };
  
  // Update code when subject changes
  useEffect(() => {
    setCode(templates[subject]);
    setTestResults([]);
  }, [subject]);
  
  // Run code handler
  const handleRunCode = () => {
    // Simple code evaluation for demo purposes
    // In a real application, this would be sent to the server for secure execution
    const results: { passed: boolean; message: string }[] = [];
    
    // Simulate test case evaluation based on language
    for (const test of testCases[subject]) {
      try {
        let result: string;
        
        if (subject === 'javascript') {
          // Extremely simplified eval for demo - never do this in production!
          // This is just for demonstration and would be replaced with a secure server-side execution
          const tempCode = code.replace(/console\.log.*/g, '');
          const func = new Function('return ' + tempCode)();
          result = func(test.input);
        } else {
          // For other languages, we'd send to server - simulate for now
          result = 'Simulation: ' + test.input;
        }
        
        const passed = result === test.expected;
        results.push({
          passed,
          message: passed 
            ? `Test passed: reverseString("${test.input}") returned "${result}"`
            : `Test failed: reverseString("${test.input}") - Expected: "${test.expected}", Received: "${result || 'undefined'}"`
        });
      } catch (err) {
        results.push({
          passed: false,
          message: `Error: ${(err as Error).message}`
        });
      }
    }
    
    setTestResults(results);
    
    toast({
      title: "Code executed",
      description: `${results.filter(r => r.passed).length} of ${results.length} tests passed`,
    });
  };
  
  // Submit code mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/submit", {
        subject,
        code
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Code submitted successfully",
        description: "Your submission has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Screen share state and handler
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Log screen share start
        await apiRequest("POST", "/api/log/screen-share", { 
          userId: user?.id, 
          started: true 
        });
        
        setIsScreenSharing(true);
        
        toast({
          title: "Screen sharing started",
          description: "Your screen is now being shared with the instructor",
        });
        
        // Handle stream end
        stream.getTracks()[0].onended = () => {
          setIsScreenSharing(false);
          apiRequest("POST", "/api/log/screen-share", { 
            userId: user?.id, 
            started: false 
          });
          
          toast({
            title: "Screen sharing stopped",
          });
        };
      }
    } catch (err) {
      toast({
        title: "Screen sharing failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Anti-cheating components */}
      <AntiCheat userId={user?.id} />
      <ScreenCapture userId={user?.id} />
      
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Coding Lab</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">{user?.email}</span>
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="bg-gray-800 text-white md:w-64 md:flex-shrink-0">
          <div className="p-4">
            <div className="py-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignment Details</h2>
              
              <div className="mt-4 space-y-4">
                {/* Subject selector */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-gray-300">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1 w-full border-gray-600 bg-gray-700 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Timer */}
                <div>
                  <label className="block text-xs font-medium text-gray-300">Remaining Time</label>
                  <CountdownTimer initialTime={90 * 60} className="mt-1 text-2xl font-mono font-semibold text-white" />
                </div>
                
                {/* Instructions */}
                <div>
                  <h3 className="text-xs font-medium text-gray-300">Instructions</h3>
                  <div className="mt-1 p-3 bg-gray-700 rounded-md text-sm text-gray-200">
                    <p>1. Write a function that reverses a string.</p>
                    <p className="mt-2">2. The function should handle empty strings and single characters.</p>
                    <p className="mt-2">3. Use the provided test cases to verify your solution.</p>
                  </div>
                </div>
                
                {/* Anti-cheat warning */}
                <div className="p-3 bg-red-800 bg-opacity-50 rounded-md text-xs">
                  <p className="font-medium text-red-200">⚠️ Anti-Cheating Measures Active:</p>
                  <ul className="mt-1 text-red-200 list-disc list-inside">
                    <li>Tab switching is detected</li>
                    <li>Copy-paste is disabled</li>
                    <li>Screen captures are logged</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Coding Assignment</h2>
              <p className="mt-1 text-sm text-gray-500">Use the editor below to write and test your code. Remember to click Submit when you're done.</p>
            </div>
            
            {/* Editor */}
            <div className="mt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
                  <div className="lg:flex-1">
                    <label htmlFor="code-editor" className="block text-sm font-medium text-gray-700">Code Editor</label>
                    <div id="editor" className="mt-1 rounded-md border border-gray-300 h-[500px]">
                      <MonacoEditor
                        language={subject}
                        value={code}
                        onChange={setCode}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3">
                    <label className="block text-sm font-medium text-gray-700">Test Results</label>
                    <div className="mt-1 bg-gray-100 rounded-md h-[500px] p-4 overflow-auto border border-gray-300">
                      {testResults.length > 0 ? (
                        <div className="text-sm font-mono space-y-3">
                          {testResults.map((result, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {result.passed ? '✓' : '✕'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-gray-900">
                                  <span className="font-medium">{result.passed ? 'Test passed:' : 'Test failed:'}</span>
                                  {' ' + result.message.split(' - ')[0]}
                                </p>
                                {!result.passed && result.message.includes('Expected:') && (
                                  <p className="text-gray-500">{result.message.split(' - ')[1]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600">
                              ℹ️
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-500">Run your code to see test results</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleRunCode}
                    className="bg-primary-50 text-primary-dark hover:bg-primary-100"
                  >
                    Run Code
                  </Button>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={handleScreenShare}
                      disabled={isScreenSharing}
                    >
                      {isScreenSharing ? "Screen Shared" : "Share Screen"}
                    </Button>
                    
                    <Button 
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Code"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
