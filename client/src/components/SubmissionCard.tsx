import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface Submission {
  id: number;
  userId: number;
  subject: string;
  code: string;
  timestamp: Date;
  user?: {
    id: number;
    email: string;
  };
}

interface SubmissionCardProps {
  submission: Submission;
  onGradeSubmit: (submissionId: number, score: number, feedback: string) => void;
  isGrading: boolean;
}

export default function SubmissionCard({ submission, onGradeSubmit, isGrading }: SubmissionCardProps) {
  const [selectedScore, setSelectedScore] = useState("90");
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  // Format time distance
  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Subject-specific styling
  const getSubjectStyles = (subject: string) => {
    switch (subject) {
      case 'javascript':
        return 'bg-yellow-50 border-yellow-200';
      case 'python':
        return 'bg-blue-50 border-blue-200';
      case 'java':
        return 'bg-red-50 border-red-200';
      case 'cpp':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getSubjectBadgeStyles = (subject: string) => {
    switch (subject) {
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800';
      case 'python':
        return 'bg-blue-100 text-blue-800';
      case 'java':
        return 'bg-red-100 text-red-800';
      case 'cpp':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleGradeSubmit = () => {
    onGradeSubmit(submission.id, parseInt(selectedScore), feedback);
    setIsOpen(false);
  };
  
  return (
    <Card className={`overflow-hidden border-[#E5E7EB] hover:shadow-md transition-shadow h-full`}>
      <CardHeader className={`py-3 px-4 ${getSubjectStyles(submission.subject)}`}>
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
          <Badge className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getSubjectBadgeStyles(submission.subject)}`}>
            {submission.subject}
          </Badge>
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="text-[#0F172A] hover:bg-[#F9F8F6] border-[#E5E7EB] rounded-lg text-sm"
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
            
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#8C977A]">Student</h3>
                  <p className="mt-1 text-sm text-[#1F2937]">
                    {submission.user?.email || `User ${submission.userId}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#8C977A]">Subject</h3>
                  <p className="mt-1 text-sm text-[#1F2937] capitalize">{submission.subject}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#8C977A]">Submitted</h3>
                  <p className="mt-1 text-sm text-[#1F2937]">{formatTime(submission.timestamp)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[#8C977A] mb-2">Code</h3>
                <pre className="p-4 bg-[#F9F8F6] rounded-lg text-sm font-mono overflow-auto max-h-80 border border-[#E5E7EB]">
                  {submission.code}
                </pre>
              </div>
              
              <div className="border-t border-[#E5E7EB] pt-4">
                <h3 className="text-sm font-medium text-[#8C977A] mb-3">Assign Grade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="score" className="text-[#1F2937]">Score (%)</Label>
                    <Select 
                      value={selectedScore} 
                      onValueChange={setSelectedScore}
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
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGradeSubmit}
                    disabled={isGrading}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg"
                  >
                    {isGrading ? (
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
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}