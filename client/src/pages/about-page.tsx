import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Shield, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            About Mini-Temp
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white mb-4">
                  <Code2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Code Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Practice coding in a secure environment with real-time feedback and automated testing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Secure Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Advanced monitoring and anti-cheat measures ensure fair and secure coding assessments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center text-white mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Student Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Designed for students to learn and practice coding in a controlled environment.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-700/50">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 mb-4">
                Mini-Temp is dedicated to providing a secure and efficient platform for coding practice and assessment. 
                We believe in creating an environment where students can focus on learning and improving their coding skills 
                without the distractions of external resources.
              </p>
              <p className="text-gray-400">
                Our platform combines modern technology with educational best practices to deliver a seamless 
                experience for both students and administrators. With features like real-time monitoring, 
                automated testing, and comprehensive feedback, we're helping shape the future of coding education.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 