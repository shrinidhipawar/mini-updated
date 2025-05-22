import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Submission, Log, User } from "@shared/schema";
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

interface SubmissionWithUser extends Submission {
  user?: User;
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

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithUser | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [userEmailSearch, setUserEmailSearch] = useState("");
  const [gradeScore, setGradeScore] = useState("90");
  const [gradeFeedback, setGradeFeedback] = useState("");
  
  const studentEmailRef = useRef<HTMLInputElement>(null);
  
  // Fetch submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<SubmissionWithUser[]>({
    queryKey: ["/api/submissions"],
  });
  
  // Fetch logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<Log[]>({
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
  const formatTime = (date: Date) => {
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
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-[#C9B88C] text-[#0F172A]";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get grade letter
  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-serif font-medium text-[#1F2937]">Administrator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#1F2937]">{user?.email}</span>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-sm text-[#1F2937] hover:bg-[#F9F8F6] border-[#E5E7EB] rounded-lg"
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
            <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1F2937] opacity-70">Total Submissions</p>
                    <h3 className="text-2xl font-bold text-[#1F2937]">{totalSubmissions}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1F2937] opacity-70">Unique Students</p>
                    <h3 className="text-2xl font-bold text-[#1F2937]">{uniqueStudents}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1F2937] opacity-70">Total Logs</p>
                    <h3 className="text-2xl font-bold text-[#1F2937]">{totalLogs}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1F2937] opacity-70">Tab Switches</p>
                    <h3 className="text-2xl font-bold text-[#1F2937]">{tabSwitchLogs}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="bg-white border border-[#E5E7EB] p-1 rounded-xl">
              <TabsTrigger 
                value="submissions" 
                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"
              >
                Code Submissions
              </TabsTrigger>
              <TabsTrigger 
                value="grades" 
                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"
              >
                Student Grades
              </TabsTrigger>
              <TabsTrigger 
                value="monitoring" 
                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"
              >
                Live Monitoring
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"
              >
                Event Logs
              </TabsTrigger>
            </TabsList>
            
            {/* Submissions tab */}
            <TabsContent value="submissions">
              <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
                <CardHeader className="border-b border-[#E5E7EB] flex flex-row justify-between items-center">
                  <CardTitle className="text-xl font-serif text-[#1F2937]">Student Code Submissions</CardTitle>
                  <div>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-[180px] border-[#E5E7EB] rounded-lg">
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
                </CardHeader>
                
                <CardContent className="p-6">
                  {isLoadingSubmissions ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#C9B88C]" />
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#1F2937] opacity-60">No submissions found.</p>
                      <p className="text-sm text-[#1F2937] opacity-60 mt-1">Students haven't submitted any code yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSubmissions.map((submission) => (
                        <Card key={submission.id} className="overflow-hidden border-[#E5E7EB] hover:shadow-md transition-shadow">
                          <CardHeader className={`py-3 px-4 
                            ${submission.subject === 'javascript' ? 'bg-yellow-50' : ''}
                            ${submission.subject === 'python' ? 'bg-blue-50' : ''}
                            ${submission.subject === 'java' ? 'bg-red-50' : ''}
                            ${submission.subject === 'cpp' ? 'bg-purple-50' : ''}
                          `}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className="h-10 w-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-medium">
                                  {submission.user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-[#1F2937]">
                                    {submission.user?.email || `User ${submission.userId}`}
                                  </h3>
                                  <p className="text-xs text-[#1F2937] opacity-70">
                                    {formatTime(submission.timestamp)}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                ${submission.subject === 'javascript' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${submission.subject === 'python' ? 'bg-blue-100 text-blue-800' : ''}
                                ${submission.subject === 'java' ? 'bg-red-100 text-red-800' : ''}
                                ${submission.subject === 'cpp' ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {submission.subject}
                              </span>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4">
                            <div className="text-sm text-[#1F2937] opacity-80 h-20 overflow-hidden relative">
                              <pre className="font-mono text-xs whitespace-pre-wrap">
                                {submission.code.substring(0, 150)}...
                              </pre>
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                          </CardContent>
                          
                          <CardFooter className="flex justify-end space-x-3 p-4 border-t border-[#E5E7EB]">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="text-[#0F172A] hover:bg-[#F9F8F6] border-[#E5E7EB] rounded-lg text-sm"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setGradeScore("90");
                                    setGradeFeedback("");
                                  }}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-serif text-[#1F2937]">
                                    Submission Review & Grading
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedSubmission && (
                                  <div className="mt-4 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <h3 className="text-sm font-medium text-[#8C977A]">Student</h3>
                                        <p className="mt-1 text-sm text-[#1F2937]">
                                          {selectedSubmission.user?.email || `User ${selectedSubmission.userId}`}
                                        </p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-[#8C977A]">Subject</h3>
                                        <p className="mt-1 text-sm text-[#1F2937] capitalize">{selectedSubmission.subject}</p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-[#8C977A]">Submitted</h3>
                                        <p className="mt-1 text-sm text-[#1F2937]">{formatTime(selectedSubmission.timestamp)}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-sm font-medium text-[#8C977A] mb-2">Code</h3>
                                      <pre className="p-4 bg-[#F9F8F6] rounded-lg text-sm font-mono overflow-auto max-h-80 border border-[#E5E7EB]">
                                        {selectedSubmission.code}
                                      </pre>
                                    </div>
                                    
                                    <div className="border-t border-[#E5E7EB] pt-4">
                                      <h3 className="text-sm font-medium text-[#8C977A] mb-3">Assign Grade</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                          <Label htmlFor="score" className="text-[#1F2937]">Score (%)</Label>
                                          <Select 
                                            value={gradeScore} 
                                            onValueChange={setGradeScore}
                                          >
                                            <SelectTrigger className="mt-1 w-full border-[#E5E7EB] rounded-lg">
                                              <SelectValue placeholder="Select a score" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="100">100% - Perfect</SelectItem>
                                              <SelectItem value="90">90% - Excellent</SelectItem>
                                              <SelectItem value="80">80% - Very Good</SelectItem>
                                              <SelectItem value="70">70% - Good</SelectItem>
                                              <SelectItem value="60">60% - Satisfactory</SelectItem>
                                              <SelectItem value="50">50% - Needs Improvement</SelectItem>
                                              <SelectItem value="40">40% - Poor</SelectItem>
                                              <SelectItem value="30">30% - Very Poor</SelectItem>
                                              <SelectItem value="20">20% - Unsatisfactory</SelectItem>
                                              <SelectItem value="10">10% - Minimal Effort</SelectItem>
                                              <SelectItem value="0">0% - Not Submitted/Plagiarized</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div className="mb-4">
                                        <Label htmlFor="feedback" className="text-[#1F2937]">Feedback</Label>
                                        <Textarea 
                                          id="feedback" 
                                          placeholder="Provide feedback to the student" 
                                          className="mt-1 border-[#E5E7EB] rounded-lg"
                                          rows={4}
                                          value={gradeFeedback}
                                          onChange={(e) => setGradeFeedback(e.target.value)}
                                        />
                                      </div>
                                      
                                      <div className="flex justify-end">
                                        <Button 
                                          onClick={handleSubmitGrade}
                                          disabled={gradeMutation.isPending}
                                          className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg"
                                        >
                                          {gradeMutation.isPending ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Saving...
                                            </>
                                          ) : (
                                            "Submit Grade"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Student Grades Tab */}
            <TabsContent value="grades">
              <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
                <CardHeader className="border-b border-[#E5E7EB]">
                  <CardTitle className="text-xl font-serif text-[#1F2937]">View Student Grades</CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="studentEmail" className="text-[#1F2937]">Student Email</Label>
                      <Input 
                        id="studentEmail" 
                        ref={studentEmailRef}
                        placeholder="Enter student email" 
                        className="mt-1 border-[#E5E7EB] rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleStudentGradeSearch}
                        className="mb-px bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                  
                  {userEmailSearch && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-[#1F2937] mb-4">Grades for: <span className="text-[#8C977A]">{userEmailSearch}</span></h3>
                      
                      {isLoadingStudentGrades ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#C9B88C]" />
                        </div>
                      ) : studentGrades.length === 0 ? (
                        <div className="text-center py-12 bg-[#F9F8F6] rounded-lg border border-[#E5E7EB]">
                          <p className="text-[#1F2937] opacity-60">No grades found for this student.</p>
                        </div>
                      ) : (
                        <Table>
                          <TableCaption>Grades for {userEmailSearch}</TableCaption>
                          <TableHeader>
                            <TableRow className="bg-[#F9F8F6]">
                              <TableHead className="text-[#1F2937]">Subject</TableHead>
                              <TableHead className="text-[#1F2937]">Score</TableHead>
                              <TableHead className="text-[#1F2937]">Feedback</TableHead>
                              <TableHead className="text-[#1F2937]">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentGrades.map((grade) => (
                              <TableRow key={grade.id} className="border-b border-[#E5E7EB]">
                                <TableCell className="font-medium capitalize">{grade.subject}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${getScoreColor(grade.score)} font-bold`}>
                                      {getGradeLetter(grade.score)}
                                    </Badge>
                                    <span className="text-[#1F2937] opacity-70">{grade.score}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-md">{grade.feedback || "No feedback provided"}</TableCell>
                                <TableCell className="text-[#1F2937] opacity-70">
                                  {new Date(grade.timestamp).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Monitoring tab */}
            <TabsContent value="monitoring">
              <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
                <CardHeader className="border-b border-[#E5E7EB]">
                  <CardTitle className="text-xl font-serif text-[#1F2937]">Live Student Monitoring</CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="overflow-hidden border-[#E5E7EB]">
                      <CardHeader className="py-3 px-4 bg-[#F9F8F6]">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-[#1F2937]">student@lab.com</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                            Active
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="relative border border-[#E5E7EB] rounded-lg overflow-hidden h-48 bg-[#F9F8F6] flex items-center justify-center">
                          <p className="text-[#1F2937] opacity-40 text-sm">Latest screenshot will appear here</p>
                          <div className="absolute bottom-2 right-2 bg-[#0F172A] bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            Awaiting activity
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-[#1F2937]">
                          <div className="flex justify-between">
                            <span>Subject: <span className="text-[#8C977A]">JavaScript</span></span>
                            <span>Time: <span className="font-mono">01:25:30</span></span>
                          </div>
                          <div className="mt-1 flex justify-between">
                            <span>Tab switches: <span className="text-red-600 font-medium">0</span></span>
                            <span>Code: <span className="text-[#C9B88C]">128 lines</span></span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end space-x-3 p-4 bg-white border-t border-[#E5E7EB]">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs rounded-lg border-[#8C977A] text-[#8C977A] hover:bg-[#8C977A] hover:text-white"
                        >
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg"
                        >
                          Full Monitor
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Logs tab */}
            <TabsContent value="logs">
              <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
                <CardHeader className="border-b border-[#E5E7EB] flex flex-row justify-between items-center">
                  <CardTitle className="text-xl font-serif text-[#1F2937]">Event Logs</CardTitle>
                  <div>
                    <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                      <SelectTrigger className="w-[180px] border-[#E5E7EB] rounded-lg">
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
                </CardHeader>
                
                <CardContent className="p-6">
                  {isLoadingLogs ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#C9B88C]" />
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#1F2937] opacity-60">No logs found with the current filter.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>Event logs from student activities</TableCaption>
                      <TableHeader>
                        <TableRow className="bg-[#F9F8F6]">
                          <TableHead className="text-[#1F2937] w-36">Time</TableHead>
                          <TableHead className="text-[#1F2937] w-40">User</TableHead>
                          <TableHead className="text-[#1F2937] w-32">Event Type</TableHead>
                          <TableHead className="text-[#1F2937]">Details</TableHead>
                          <TableHead className="text-[#1F2937] w-24"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id} className="border-b border-[#E5E7EB]">
                            <TableCell className="text-sm font-medium text-[#1F2937]">
                              {formatTime(log.timestamp)}
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2937]">
                              User {log.userId}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                                ${log.type === 'tab-switch' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${log.type === 'screenshot' ? 'bg-blue-100 text-blue-800' : ''}
                                ${log.type === 'screen-share' ? 'bg-green-100 text-green-800' : ''}
                              `}>
                                {log.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-[#1F2937] opacity-80">
                              {log.type === 'screenshot' ? (
                                <span>Screenshot captured</span>
                              ) : log.type === 'tab-switch' ? (
                                <span>Tab switch detected</span>
                              ) : (
                                <span>Screen sharing {JSON.parse(log.data || '{}').started ? 'started' : 'ended'}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {log.type === 'screenshot' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setSelectedLog(log)}
                                      className="rounded-lg border-[#8C977A] text-[#8C977A] hover:bg-[#8C977A] hover:text-white"
                                      size="sm"
                                    >
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle className="font-serif text-[#1F2937]">Student Screenshot</DialogTitle>
                                    </DialogHeader>
                                    {selectedLog && (
                                      <div className="mt-4">
                                        <img 
                                          src={selectedLog.data || ''} 
                                          alt="Screenshot" 
                                          className="w-full rounded-lg border border-[#E5E7EB]"
                                        />
                                        <p className="mt-2 text-xs text-[#1F2937] opacity-60 text-center">
                                          Captured {formatTime(selectedLog.timestamp)}
                                        </p>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}