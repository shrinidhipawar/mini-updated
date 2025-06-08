import { useState } from "react";
import MonacoEditor from "./monaco-editor";
import CodeSubmission from "./CodeSubmission";
import { toast } from "sonner";

interface CodeEditorWithSubmissionProps {
  language: string;
  initialCode?: string;
}

export default function CodeEditorWithSubmission({ language, initialCode = "" }: CodeEditorWithSubmissionProps) {
  const [code, setCode] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (code: string, notes: string) => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          notes,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit code");
      }

      toast.success("Code submitted successfully!");
      setCode(""); // Clear the editor after successful submission
    } catch (error) {
      toast.error("Failed to submit code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[400px]">
        <MonacoEditor
          value={code}
          onChange={setCode}
          language={language}
        />
      </div>
      <CodeSubmission
        code={code}
        language={language}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 