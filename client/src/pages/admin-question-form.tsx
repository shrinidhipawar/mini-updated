import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function AdminQuestionForm({ onQuestionCreated }: { onQuestionCreated: () => void }) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, timeLimit })
      })

      if (!res.ok) throw new Error("Failed to create question")
      toast({ title: "Question Created", description: "Your question has been saved." })
      setTitle("")
      setDescription("")
      setTimeLimit("")
      onQuestionCreated()
    } catch (err) {
      toast({ title: "Error", description: "Could not create question.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md bg-[#1f2333] border border-gray-600 text-white px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md bg-[#1f2333] border border-gray-600 text-white px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Time Limit (in minutes)</label>
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          required
          className="mt-1 block w-full rounded-md bg-[#1f2333] border border-gray-600 text-white px-3 py-2"
        />
      </div>

      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all">
        {loading ? "Submitting..." : "Submit Question"}
      </Button>
    </form>
  )
}
