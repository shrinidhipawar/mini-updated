import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Submission, User } from "@shared/schema";
import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PieChart, BarChart, AlertCircle, Users, Camera, Clipboard, Share2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TestCaseCreator, { TestCase } from "@/components/TestCaseCreator";
import { useToast } from "@/hooks/use-toast";
import AdminQuestionForm from "@/pages/admin-question-form"


interface SubmissionWithUser extends Submission {
  user?: User;
  score?: number;
}

interface SubmissionGrade {
  submissionId: number;
  score: number;
  feedback: string;
}

interface StudentGrade {
  id: number;
  submissionId: number;
  userId: number;
  subject: string;
  score: number;
  feedback: string;
  timestamp: string;
}

interface ActivityLog {
  id: number;
  userId: number;
  timestamp: Date;
  data: string | null;
  type: string;
  userEmail?: string;
  details?: string;
}

// function AdminQuestionForm({ onQuestionCreated }: { onQuestionCreated: () => void }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [timeLimit, setTimeLimit] = useState(60);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     try {
//       const res = await fetch("/api/admin/questions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title, description, timeLimit }),
//       });
//       if (!res.ok) throw new Error("Failed to create question");
//       setTitle("");
//       setDescription("");
//       setTimeLimit(60);
//       setSuccess("Question created!");
//       if (onQuestionCreated) onQuestionCreated();
//     } catch (err) {
//       setError("Failed to create question");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-[#232946]/80 backdrop-blur-md rounded-xl shadow p-6 mb-8 max-w-2xl mx-auto flex flex-col gap-4 border border-gray-700"
//     >
//       <h3 className="text-xl font-bold mb-2 text-white">Create New Question</h3>
//       {error && <div className="text-red-400">{error}</div>}
//       {success && <div className="text-green-400">{success}</div>}
//       <input
//         className="border border-gray-700 bg-[#181c2a] text-white rounded px-3 py-2"
//         placeholder="Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         required
//       />
//       <textarea
//         className="border border-gray-700 bg-[#181c2a] text-white rounded px-3 py-2"
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         required
//         rows={3}
//       />
//       <div>
//         <label className="mr-2 font-medium text-white">Time Limit (minutes):</label>
//         <input
//           type="number"
//           min={1}
//           className="border border-gray-700 bg-[#181c2a] text-white rounded px-2 py-1 w-24"
//           value={timeLimit}
//           onChange={(e) => setTimeLimit(Number(e.target.value))}
//           required
//         />
//       </div>
//       <button
//         type="submit"
//         className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all"
//         disabled={loading}
//       >
//         {loading ? "Creating..." : "Create Question"}
//       </button>
//     </form>
//   );
// }

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithUser | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [userEmailSearch, setUserEmailSearch] = useState("");
  const [gradeScore, setGradeScore] = useState("90");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [selectedTestSubject, setSelectedTestSubject] = useState("javascript");
  const [isSavingTestCases, setIsSavingTestCases] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [initialTestCases, setInitialTestCases] = useState<TestCase[]>([]);
  
  const studentEmailRef = useRef<HTMLInputElement>(null);
  
  // Fetch submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<SubmissionWithUser[]>({
    queryKey: ["/api/submissions"],
  });
  
  // Fetch logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs"],
  });
  
  // Fetch student grades (when email is provided)
  const { data: studentGrades = [], isLoading: isLoadingStudentGrades } = useQuery<StudentGrade[]>({
    queryKey: ["/api/admin/grades", userEmailSearch],
    enabled: userEmailSearch !== "",
  });
  
  // Submit grade mutation
  const gradeMutation = useMutation({
    mutationFn: async (data: SubmissionGrade) => {
      const res = await apiRequest("POST", "/api/admin/grade", data);
      return await res.json();
    },
    onSuccess: () => {
      // Close the dialog and refresh data
      setSelectedSubmission(null);
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/grades"] });
      
      toast({
        title: "Grade submitted successfully",
        description: "The student will be able to see this grade in their dashboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit grade",
        description: error.message,
        variant: "destructive",
      });
    }
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
  const formatTime = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Handle grade submission
  const handleSubmitGrade = () => {
    if (!selectedSubmission) return;
    
    gradeMutation.mutate({
      submissionId: selectedSubmission.id,
      score: parseInt(gradeScore),
      feedback: gradeFeedback
    });
  };
  
  // Handle search for student grades
  const handleStudentGradeSearch = () => {
    if (studentEmailRef.current && studentEmailRef.current.value) {
      setUserEmailSearch(studentEmailRef.current.value);
    }
  };
  
  // Get statistics
  const totalSubmissions = submissions.length;
  const totalLogs = logs.length;
  // Fixed the Set iteration issue
  const uniqueStudentIds = Array.from(new Set(submissions.map(s => s.userId)));
  const uniqueStudents = uniqueStudentIds.length;
  const tabSwitchLogs = logs.filter(log => log.type === 'tab-switch').length;
  const screenshotLogs = logs.filter(log => log.type === 'screenshot').length;
  const screenShareLogs = logs.filter(log => log.type === 'screen-share').length;
  
  // Get score badge color
  const getScoreColor = (score: number | undefined) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-[#C9B88C] text-[#0F172A]";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get grade letter
  const getGradeLetter = (score: number | undefined) => {
    if (!score) return "N/A";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Administrator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">{user?.email}</span>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Admin content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Dashboard overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white mr-4">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Submissions</p>
                    <h3 className="text-2xl font-bold text-white">{totalSubmissions}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white mr-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unique Students</p>
                    <h3 className="text-2xl font-bold text-white">{uniqueStudents}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center text-white mr-4">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Logs</p>
                    <h3 className="text-2xl font-bold text-white">{totalLogs}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white mr-4">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tab Switches</p>
                    <h3 className="text-2xl font-bold text-white">{tabSwitchLogs}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* <section className="min-h-screen py-10 px-2 sm:px-0 bg-gradient-to-br from-[#181c2a] via-[#232946] to-[#181c2a]">
  {/* Section Header */}
  {/* <header className="mb-6">
    <h1 className="text-3xl font-bold text-white mb-1">Create a Question</h1>
    <p className="text-gray-400">Design coding questions and manage their availability.</p>
  </header>

  {/* Create Question Form */}
  {/* <AdminQuestionForm onQuestionCreated={() => {}} />
</section>   */}
  <header className="mb-6">
    <h1 className="text-3xl font-bold text-white mb-1">Create a Question</h1>
    <p className="text-gray-400">Design coding questions and manage their availability.</p>
  </header>
  

<Dialog>
  <DialogTrigger asChild>
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all">
      Create a Question
    </Button>
  </DialogTrigger>

  <DialogContent className="bg-[#232946] text-white border border-gray-700 shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-white mb-4">Create a New Question</DialogTitle>
    </DialogHeader>
    <AdminQuestionForm onQuestionCreated={() => {}} />
  </DialogContent>
</Dialog>



<header className="mb-6">
    <h1 className="text-3xl font-bold text-white mb-1">Manage students</h1>
    <p className="text-gray-400">View submissions, logs and more.</p>
  </header>

          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-1 rounded-xl">
              <TabsTrigger 
                value="submissions" 
                className="rounded-lg px-4 py-2 text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Code Submissions
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="rounded-lg px-4 py-2 text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Activity Logs
              </TabsTrigger>
              <TabsTrigger 
                value="grades" 
                className="rounded-lg px-4 py-2 text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Student Grades
              </TabsTrigger>
              <TabsTrigger 
                value="test-cases" 
                className="rounded-lg px-4 py-2 text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Test Cases
              </TabsTrigger>
            </TabsList>
            
            {/* Test Cases Tab */}
            <TabsContent value="test-cases">
              <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader className="border-b border-gray-700/50 flex flex-row justify-between items-center">
                  <CardTitle className="text-xl font-bold text-white">Create & Manage Test Cases</CardTitle>
                  <div>
                    <Select value={selectedTestSubject} onValueChange={setSelectedTestSubject}>
                      <SelectTrigger className="w-[180px] border-gray-700 rounded-lg">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-400 mb-4">
                      Create and edit test cases for the {selectedTestSubject.charAt(0).toUpperCase() + selectedTestSubject.slice(1)} challenge. 
                      These test cases will be used to evaluate student submissions automatically.
                    </p>
                    
                    <Button 
                      onClick={() => {
                        // Fetch the current test cases for this subject
                        fetch(`/api/admin/test-cases/${selectedTestSubject}`)
                          .then(res => res.json())
                          .then(data => {
                            setInitialTestCases(data);
                            setShowTestCaseModal(true);
                          })
                          .catch(err => {
                            toast({
                              title: "Error loading test cases",
                              description: err.message,
                              variant: "destructive"
                            });
                          });
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
                    >
                      Edit Test Cases
                    </Button>
                    
                    {/* Test Case Creator Dialog */}
                    <Dialog open={showTestCaseModal} onOpenChange={setShowTestCaseModal}>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-white">
                            Test Case Editor - {selectedTestSubject.charAt(0).toUpperCase() + selectedTestSubject.slice(1)}
                          </DialogTitle>
                        </DialogHeader>
                        <TestCaseCreator 
                          subject={selectedTestSubject}
                          initialTestCases={initialTestCases}
                          isSaving={isSavingTestCases}
                          onSave={(testCases) => {
                            setIsSavingTestCases(true);
                            // Save test cases to API
                            fetch(`/api/admin/test-cases/${selectedTestSubject}`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ testCases }),
                            })
                              .then(response => response.json())
                              .then(data => {
                                if (data.success) {
                                  toast({
                                    title: "Test cases saved",
                                    description: `Saved ${testCases.length} test cases for ${selectedTestSubject}`,
                                  });
                                  setShowTestCaseModal(false);
                                } else {
                                  throw new Error('Failed to save test cases');
                                }
                              })
                              .catch(error => {
                                toast({
                                  title: "Error saving test cases",
                                  description: error.message,
                                  variant: "destructive"
                                });
                              })
                              .finally(() => {
                                setIsSavingTestCases(false);
                              });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-white mb-2">Current Challenge</h3>
                    <div className="p-4 border border-gray-700/50 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium text-white">Prime Number Challenge</h4>
                      <p className="text-gray-400 mt-1">
                        Create a function that checks if a number is prime. The function should return true if the number is prime and false otherwise.
                      </p>
                      <div className="mt-3 p-3 bg-gray-700/50 rounded border border-gray-700/50">
                        <pre className="text-xs font-mono">
                          {`// Example in JavaScript:
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  let i = 5;
  while (i * i <= num) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
    i += 6;
  }
  return true;
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Monitoring tab */}
            <TabsContent value="monitoring">
              <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader className="border-b border-gray-700/50">
                  <CardTitle className="text-xl font-bold text-white">Student Activity Monitoring</CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Tab Switch Activity */}
                    <Card className="bg-gray-700/50 shadow-sm rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center text-white mr-4">
                            <Clipboard className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Tab Switches</p>
                            <h3 className="text-2xl font-bold text-white">{tabSwitchLogs}</h3>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-400">
                          Detects when students switch tabs or applications during an assessment. 
                          This may indicate attempts to search for solutions online.
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Screenshot Activity */}
                    <Card className="bg-gray-700/50 shadow-sm rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white mr-4">
                            <Camera className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Screenshots</p>
                            <h3 className="text-2xl font-bold text-white">{screenshotLogs}</h3>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-400">
                          Periodic screen captures stored in memory as base64 data. These show student 
                          activities and can be viewed in the logs section.
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Screen Share Activity */}
                    <Card className="bg-gray-700/50 shadow-sm rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-lime-600 flex items-center justify-center text-white mr-4">
                            <Share2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Screen Shares</p>
                            <h3 className="text-2xl font-bold text-white">{screenShareLogs}</h3>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-400">
                          Screen sharing implementation via HTML2Canvas (not WebRTC). Images are 
                          stored as base64 data in logs.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Recent Student Activities</h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-700/50">
                          <TableHead className="text-gray-400">Type</TableHead>
                          <TableHead className="text-gray-400">Student</TableHead>
                          <TableHead className="text-gray-400">Time</TableHead>
                          <TableHead className="text-gray-400">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.slice(0, 10).map((log) => (
                          <TableRow key={log.id} className="border-b border-gray-700/50">
                            <TableCell>
                              <Badge className={`
                                ${log.type === 'tab-switch' ? 'bg-orange-100 text-orange-800' : ''}
                                ${log.type === 'screenshot' ? 'bg-blue-100 text-blue-800' : ''}
                                ${log.type === 'screen-share' ? 'bg-green-100 text-green-800' : ''}
                              `}>
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell>Student {log.userId}</TableCell>
                            <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Log detail dialog */}
                    <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-white">
                            Activity Details - {selectedLog?.type}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-white">Student ID</h4>
                            <p className="text-gray-400">{selectedLog?.userId}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Timestamp</h4>
                            <p className="text-gray-400">
                              {selectedLog?.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : ''}
                            </p>
                          </div>
                          {selectedLog?.type === 'screenshot' || selectedLog?.type === 'screen-share' ? (
                            <div>
                              <h4 className="font-medium text-white">Captured Image</h4>
                              <div className="mt-2 border border-gray-700/50 rounded-lg p-2 bg-gray-700/50">
                                {selectedLog.data && (
                                  <img 
                                    src={selectedLog.data.startsWith('data:') ? selectedLog.data : `data:image/png;base64,${selectedLog.data}`} 
                                    alt="Screen capture" 
                                    className="max-w-full h-auto rounded"
                                  />
                                )}
                              </div>
                              <p className="mt-2 text-gray-400 opacity-70">
                                Images are captured using HTML2Canvas and stored as base64 data.
                                For a real WebRTC implementation, you would need a media server.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h4 className="font-medium text-white">Activity Data</h4>
                              <pre className="mt-2 border border-gray-700/50 rounded-lg p-3 bg-gray-700/50 overflow-auto text-sm">
                                {JSON.stringify(selectedLog, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Anti-Cheat Implementation Details</h3>
                    <div className="p-4 border border-gray-700/50 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium text-white">System Overview</h4>
                      <ul className="mt-2 space-y-2 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>Tab detection monitors when students leave the assessment window</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>Copy/paste prevention blocks students from copying external code</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>Screen captures provide visual evidence of student activities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>Docker simulation provides a secure execution environment (note: not actually using Docker, just simulating it)</span>
                        </li>
                      </ul>
                      <p className="mt-4 text-gray-400">
                        <strong>Note:</strong> This system does not use WebRTC for screen sharing but instead takes periodic screenshots
                        using HTML2Canvas. These are stored in memory as base64 data and accessible through the logs section.
                        In a production environment, these would be stored in a database or secure file storage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Submissions tab */}
            <TabsContent value="submissions">
              <div className="min-h-screen bg-gradient-to-br from-[#181c2a] via-[#232946] to-[#181c2a] py-10 px-2 sm:px-0">
                <div className="max-w-5xl mx-auto">
                  

                  {/* Submissions Section */}
                  <section>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-bold text-white">Student Code Submissions</h2>
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
                  </section>
                </div>
              </div>
            </TabsContent>
            
            {/* Student Grades Tab */}
            <TabsContent value="grades" className="space-y-6">
              <div className="flex gap-4 items-center">
                <Input
                  ref={studentEmailRef}
                  placeholder="Enter student email"
                  className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
                <Button
                  onClick={handleStudentGradeSearch}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                >
                  Search
                </Button>
              </div>

              {userEmailSearch && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700/50">
                        <TableHead className="text-gray-300">Subject</TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead className="text-gray-300">Feedback</TableHead>
                        <TableHead className="text-gray-300">Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGrades.map((grade) => (
                        <TableRow key={grade.id} className="border-gray-700/50">
                          <TableCell className="text-gray-200 capitalize">{grade.subject}</TableCell>
                          <TableCell>
                            <Badge className={getScoreColor(grade.score)}>
                              {getGradeLetter(grade.score)} ({grade.score}%)
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">{grade.feedback}</TableCell>
                          <TableCell className="text-gray-200">{formatTime(grade.timestamp)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            {/* Logs tab */}
            <TabsContent value="logs" className="space-y-6">
              <div className="flex justify-between items-center">
                <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                  <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-gray-200 hover:bg-gray-700">All Types</SelectItem>
                    <SelectItem value="tab-switch" className="text-gray-200 hover:bg-gray-700">Tab Switches</SelectItem>
                    <SelectItem value="screenshot" className="text-gray-200 hover:bg-gray-700">Screenshots</SelectItem>
                    <SelectItem value="screen-share" className="text-gray-200 hover:bg-gray-700">Screen Shares</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/50">
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Timestamp</TableHead>
                      <TableHead className="text-gray-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-gray-700/50">
                        <TableCell className="text-gray-200 capitalize">{log.type.replace('-', ' ')}</TableCell>
                        <TableCell className="text-gray-200">{log.userEmail}</TableCell>
                        <TableCell className="text-gray-200">{formatTime(log.timestamp)}</TableCell>
                        <TableCell className="text-gray-200">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}