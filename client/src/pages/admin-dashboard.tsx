import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Submission, Log } from "@shared/schema";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  });
  
  // Fetch logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ["/api/logs"],
  });
  
  // Filter submissions by subject
  const filteredSubmissions = subjectFilter === "all" 
    ? submissions 
    : submissions.filter(submission => submission.subject === subjectFilter);
  
  // Filter logs by type
  const filteredLogs = logTypeFilter === "all"
    ? logs
    : logs.filter(log => log.type === logTypeFilter);
  
  // Format time distance
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
          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="mb-4">
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="logs">Event Logs</TabsTrigger>
            </TabsList>
            
            {/* Submissions tab */}
            <TabsContent value="submissions">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Code Submissions</h2>
                  <div className="flex space-x-4">
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {isLoadingSubmissions ? (
                      <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Loading submissions...</li>
                    ) : filteredSubmissions.length === 0 ? (
                      <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No submissions found</li>
                    ) : (
                      filteredSubmissions.map((submission) => (
                        <li key={submission.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                                    👤
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    User ID: {submission.userId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Submitted {formatTime(submission.timestamp)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${submission.subject === 'javascript' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${submission.subject === 'python' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${submission.subject === 'java' ? 'bg-red-100 text-red-800' : ''}
                                  ${submission.subject === 'cpp' ? 'bg-purple-100 text-purple-800' : ''}
                                `}>
                                  {submission.subject.charAt(0).toUpperCase() + submission.subject.slice(1)}
                                </span>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      className="text-primary-dark bg-primary-50 hover:bg-primary-100 text-xs"
                                      onClick={() => setSelectedSubmission(submission)}
                                    >
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle>Submission Details</DialogTitle>
                                    </DialogHeader>
                                    {selectedSubmission && (
                                      <div className="mt-4 space-y-4">
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">User</h3>
                                          <p className="mt-1 text-sm text-gray-900">ID: {selectedSubmission.userId}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Subject</h3>
                                          <p className="mt-1 text-sm text-gray-900">{selectedSubmission.subject}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Submitted</h3>
                                          <p className="mt-1 text-sm text-gray-900">{formatTime(selectedSubmission.timestamp)}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Code</h3>
                                          <pre className="mt-1 p-3 bg-gray-100 rounded-md text-sm font-mono overflow-auto max-h-80">
                                            {selectedSubmission.code}
                                          </pre>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <span className="truncate max-w-md">{submission.code.substring(0, 100)}...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            {/* Monitoring tab */}
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
            
            {/* Logs tab */}
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
                        <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingLogs ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading logs...</td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No logs found</td>
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
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${log.type === 'tab-switch' ? 'bg-red-100 text-red-800' : ''}
                                ${log.type === 'screenshot' ? 'bg-blue-100 text-blue-800' : ''}
                                ${log.type === 'screen-share' ? 'bg-green-100 text-green-800' : ''}
                              `}>
                                {log.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.type === 'screenshot' 
                                ? 'Screenshot captured' 
                                : log.type === 'screen-share'
                                  ? 'Screen sharing event'
                                  : 'Tab switch detected'}
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
                                          {selectedLog.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-700">Time</h3>
                                        <p className="mt-1 text-sm text-gray-900">{formatTime(selectedLog.timestamp)}</p>
                                      </div>
                                      {selectedLog.type === 'screenshot' && selectedLog.data && (
                                        <div>
                                          <h3 className="text-sm font-medium text-gray-700">Screenshot</h3>
                                          <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                                            <img src={selectedLog.data} alt="Screenshot" className="w-full h-auto" />
                                          </div>
                                        </div>
                                      )}
                                      {selectedLog.type !== 'screenshot' && selectedLog.data && (
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
