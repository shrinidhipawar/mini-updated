import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Submission, Log } from "@shared/schema";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  
  // Fetch submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions");
      return res.json();
    }
  });
  
  // Fetch logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ["/api/logs"]
  });
  
  // Filter submissions by subject
  const filteredSubmissions = subjectFilter === "all" 
    ? submissions 
    : submissions.filter((submission) => submission.subject === subjectFilter);
  
  // Filter logs by type
  const filteredLogs = logTypeFilter === "all"
    ? logs
    : logs.filter((log) => log.type === logTypeFilter);
  
  // Format time
  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
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
        </div>
      </header>
      
      {/* Admin content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
<TabsContent value="submissions">
  <div className="min-h-screen py-10 px-2 sm:px-0 bg-gradient-to-br from-[#181c2a] via-[#232946] to-[#181c2a]">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white drop-shadow">Student Code Submissions</h2>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px] bg-[#232946] border-gray-700 text-gray-200 shadow-sm rounded-lg">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent className="bg-[#232946] border-gray-700">
            <SelectItem value="all" className="text-gray-200 hover:bg-gray-700">All Subjects</SelectItem>
            <SelectItem value="javascript" className="text-gray-200 hover:bg-gray-700">JavaScript</SelectItem>
            <SelectItem value="python" className="text-gray-200 hover:bg-gray-700">Python</SelectItem>
            <SelectItem value="java" className="text-gray-200 hover:bg-gray-700">Java</SelectItem>
            <SelectItem value="cpp" className="text-gray-200 hover:bg-gray-700">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingSubmissions ? (
        <div className="text-center text-gray-400 py-12">Loading submissions...</div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No submissions found</div>
      ) : (
        <div className="flex flex-col gap-10 items-center">
          {filteredSubmissions.map((submission) => {
            const userName = `User ${submission.userId}`;
            const userInitial = userName.charAt(0).toUpperCase();
            const language = submission.subject || "Unknown";
            return (
              <div
                key={submission.id}
                className="bg-[#232946]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-0 flex flex-col gap-0 w-full max-w-2xl transition-transform hover:scale-[1.01]"
              >
                {/* Card header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow">
                      {userInitial}
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-white">{userName}</div>
                      <div className="text-gray-300 text-sm">{formatTime(submission.timestamp)}</div>
                    </div>
                  </div>
                  <span className="bg-blue-700/20 text-blue-200 font-semibold px-5 py-2 rounded-full text-sm tracking-wide shadow">
                    {language.toUpperCase()}
                  </span>
                </div>
                {/* Code preview */}
                <pre className="bg-[#181c2a] rounded-b-none rounded-b-2xl p-7 text-base font-mono text-blue-100 max-h-56 overflow-auto whitespace-pre-wrap border-t border-gray-800">
                  {submission.code}
                </pre>
                {/* Review button with modal */}
                <div className="flex justify-end px-8 pb-7 pt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="border border-blue-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all">
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#232946] border border-gray-700 rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white mb-2">Review & Grade Submission</DialogTitle>
                      </DialogHeader>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-1">Code Preview</div>
                        <pre className="bg-[#181c2a] rounded-md p-4 text-sm font-mono text-blue-100 max-h-80 overflow-auto whitespace-pre-wrap border border-gray-800">
                          {submission.code}
                        </pre>
                      </div>
                      <div className="mb-4">
                        <div className="text-lg font-semibold mb-2 text-white">Assign Grade</div>
                        <Select>
                          <SelectTrigger className="w-full max-w-xs bg-[#232946] border-gray-700 text-gray-200">
                            <SelectValue placeholder="Select score" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#232946] border-gray-700">
                            <SelectItem value="100" className="text-gray-200">100% - Perfect</SelectItem>
                            <SelectItem value="90" className="text-gray-200">90% - Excellent</SelectItem>
                            <SelectItem value="80" className="text-gray-200">80% - Good</SelectItem>
                            <SelectItem value="70" className="text-gray-200">70% - Satisfactory</SelectItem>
                            <SelectItem value="60" className="text-gray-200">60% - Needs Improvement</SelectItem>
                            <SelectItem value="0" className="text-gray-200">0% - No Submission</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-4">
                        <div className="text-lg font-semibold mb-2 text-white">Feedback</div>
                        <textarea className="w-full border border-gray-700 rounded-md p-2 min-h-[60px] bg-[#181c2a] text-blue-100" placeholder="Provide feedback to the student" />
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all">
                          Submit Grade
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
</TabsContent>
            
            {/* Monitoring Tab */}
            <TabsContent value="monitoring">
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Live Student Monitoring</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">student@lab.com</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                          Active
                        </span>
                      </div>
                      <div className="mt-4 relative border border-gray-200 rounded-md overflow-hidden h-48 bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Latest screenshot will appear here</p>
                        <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          Awaiting activity
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Subject: JavaScript</span>
                          <span>Time remaining: --:--:--</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span>Tab switches: 0</span>
                          <span>Code length: 0 chars</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        <Button variant="outline" size="sm" className="text-xs">
                          Message
                        </Button>
                        <Button size="sm" className="text-xs">
                          Full Monitor
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Logs Tab */}
            <TabsContent value="logs">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Event Logs</h2>
                  <div className="flex space-x-4">
                    <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="tab-switch">Tab Switch</SelectItem>
                        <SelectItem value="screenshot">Screenshot</SelectItem>
                        <SelectItem value="screen-share">Screen Share</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingLogs ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Loading logs...
                          </td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No logs found
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTime(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              User ID: {log.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${log.type === "tab-switch" ? "bg-red-100 text-red-800" : ""}
                                  ${log.type === "screenshot" ? "bg-blue-100 text-blue-800" : ""}
                                  ${log.type === "screen-share" ? "bg-green-100 text-green-800" : ""}
                                `}
                              >
                                {log.type.split("-").map((word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(" ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.type === "screenshot"
                                ? "Screenshot captured"
                                : log.type === "screen-share"
                                ? "Screen sharing event"
                                : "Tab switch detected"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="link" 
                                    className="text-primary hover:text-primary-dark"
                                    onClick={() => setSelectedLog(log)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Log Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedLog && (
                                    <div className="mt-4 space-y-4">
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-700">User</h3>
                                        <p className="mt-1 text-sm text-gray-900">ID: {selectedLog.userId}</p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-700">Type</h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                          {selectedLog.type
                                            .split("-")
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}
                                        </p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-700">Time</h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                          {formatTime(selectedLog.timestamp)}
                                        </p>
                                      </div>
                                      {selectedLog.type === "screenshot" && selectedLog.data && (
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Screenshot</h3>
                                          <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                                            <img src={selectedLog.data} alt="Screenshot" className="w-full h-auto" />
                                          </div>
                                        </div>
                                      )}
                                      {selectedLog.type !== "screenshot" && selectedLog.data && (
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Data</h3>
                                          <pre className="mt-1 p-3 bg-gray-100 rounded-md text-sm font-mono overflow-auto max-h-60">
                                            {selectedLog.data}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
