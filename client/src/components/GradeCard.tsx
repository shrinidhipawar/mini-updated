import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface GradeData {
  id: number;
  subject: string;
  score: number;
  feedback: string;
  timestamp: string;
}

interface GradeCardProps {
  title: string;
  subtitle?: string;
  grades: GradeData[];
  isLoading?: boolean;
}

export default function GradeCard({ title, subtitle, grades, isLoading = false }: GradeCardProps) {
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-[#C9B88C] text-[#0F172A]";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Helper function to get grade letter
  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  return (
    <Card className="bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
      <CardHeader className="border-b border-[#E5E7EB]">
        <CardTitle className="text-xl font-serif text-[#1F2937]">{title}</CardTitle>
        {subtitle && <p className="text-sm text-[#1F2937] opacity-70">{subtitle}</p>}
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#C9B88C] border-opacity-50 rounded-full border-t-[#1F2937]"></div>
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F8F6] rounded-lg">
            <p className="text-[#1F2937] opacity-60">No grades available.</p>
            <p className="text-sm text-[#1F2937] opacity-50 mt-1">Complete assignments to see your performance here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F8F6]">
                <TableHead className="text-[#1F2937] w-1/5">Subject</TableHead>
                <TableHead className="text-[#1F2937] w-1/5">Grade</TableHead>
                <TableHead className="text-[#1F2937]">Feedback</TableHead>
                <TableHead className="text-[#1F2937] w-1/6 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id} className="border-b border-[#E5E7EB]">
                  <TableCell className="font-medium capitalize text-[#1F2937]">
                    {grade.subject}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getScoreColor(grade.score)} font-bold`}>
                        {getGradeLetter(grade.score)}
                      </Badge>
                      <span className="text-[#1F2937] opacity-70">{grade.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#1F2937] max-w-xs truncate">
                    {grade.feedback || "No feedback provided"}
                  </TableCell>
                  <TableCell className="text-[#1F2937] opacity-70 text-right">
                    {new Date(grade.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}