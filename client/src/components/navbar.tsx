import { Link } from "wouter";
import { Button } from "./ui/button";
import { HelpCircle, Info, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { user, isLoading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent cursor-pointer">
                College Lab Tracker
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/about">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </Link>
            {!isLoading && user && (
              <Link href="/settings">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 