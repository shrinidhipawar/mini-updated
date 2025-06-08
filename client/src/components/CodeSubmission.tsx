import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CodeSubmissionProps {
  code: string;
  language: string;
  onSubmit: (code: string, notes: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function CodeSubmission({ code, language, onSubmit, isSubmitting }: CodeSubmissionProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    await onSubmit(code, notes);
    setNotes(""); // Clear notes after submission
  };

  return (
    <Card className="mt-4 border-[#E5E7EB]">
      <CardHeader className="py-3 px-4 bg-[#F9F8F6]">
        <h3 className="text-lg font-medium text-[#1F2937]">Submit Your Code</h3>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes" className="text-[#1F2937]">
              Add Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or explanations about your submission..."
              className="mt-1 border-[#E5E7EB] rounded-lg"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E5E7EB]">
            <p className="text-sm text-[#1F2937]">
              <span className="font-medium">Language:</span> {language}
            </p>
            <p className="text-sm text-[#1F2937] mt-1">
              <span className="font-medium">Code Length:</span> {code.length} characters
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end p-4 border-t border-[#E5E7EB]">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Code"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 