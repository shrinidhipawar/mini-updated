import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I get started with Mini-Temp?",
    answer: "To get started, simply create an account using your email address. Once registered, you can access the coding environment and start practicing with our pre-configured challenges."
  },
  {
    question: "What programming languages are supported?",
    answer: "Currently, we support JavaScript, Python, and Java. Each language has its own dedicated environment with appropriate testing frameworks and tools."
  },
  {
    question: "How does the anti-cheat system work?",
    answer: "Our anti-cheat system monitors tab switches, takes periodic screenshots, and tracks screen sharing activities. This helps ensure a fair and secure coding environment for all users."
  },
  {
    question: "Can I save my progress?",
    answer: "Yes, your code is automatically saved as you work. You can also submit your solutions at any time for grading and feedback."
  },
  {
    question: "How do I get help if I'm stuck?",
    answer: "If you're having trouble with a challenge, you can use the built-in help system or contact your instructor. For technical issues, please use the support contact form."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Help & Support
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white mb-4">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Need help? Our support team is here to assist you with any questions or issues you may have.
                </p>
                <a 
                  href="mailto:support@minitemp.com" 
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  support@minitemp.com
                </a>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white mb-4">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  New to Mini-Temp? Check out our quick start guide to get up and running in minutes.
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Guide →
                </a>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="border border-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="text-white font-medium">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 py-4 bg-gray-800/30">
                        <p className="text-gray-400">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 