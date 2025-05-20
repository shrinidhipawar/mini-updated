import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, LockIcon } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/student/dashboard");
      }
    }
  }, [user, setLocation]);
  
  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login form column */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:w-1/2 bg-[#F9F8F6]">
        <Card className="max-w-md w-full bg-white shadow-sm rounded-2xl border-[#E5E7EB]">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#0F172A] flex items-center justify-center">
              <LockIcon className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#1F2937]">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-[#1F2937] opacity-70 mt-1">
              Sign in to access the College Coding Lab
            </p>
          </CardHeader>
          
          <CardContent className="pt-4 px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1F2937]">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          autoComplete="email"
                          className="border-[#E5E7EB] focus:border-[#C9B88C] rounded-lg"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1F2937]">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          autoComplete="current-password"
                          className="border-[#E5E7EB] focus:border-[#C9B88C] rounded-lg"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg py-2 font-medium" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
              <div className="mx-3 text-xs text-[#1F2937] opacity-60">or</div>
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
            </div>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-[#1F2937]">
                Don't have an account?{" "}
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <Link href="/register" className="text-[#0F172A] hover:underline font-medium">
                  Student Sign up
                </Link>
                <span className="text-[#E5E7EB]">|</span>
                <Link href="/admin/register" className="text-[#8C977A] hover:underline font-medium">
                  Admin Sign up
                </Link>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-8 pt-0">
            <div className="w-full text-center">
              <p className="mb-2 text-xs font-medium text-[#C9B88C]">
                Demo Credentials:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#1F2937]">
                <div className="bg-[#F9F8F6] p-2 rounded-lg">
                  <p className="font-medium">Student</p>
                  <p className="opacity-70">student@lab.com</p>
                  <p className="opacity-70">student123</p>
                </div>
                <div className="bg-[#F9F8F6] p-2 rounded-lg">
                  <p className="font-medium">Admin</p>
                  <p className="opacity-70">admin@lab.com</p>
                  <p className="opacity-70">admin123</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero column - visible on md screens and larger */}
      <div className="hidden md:flex md:w-1/2 bg-[#0F172A] flex-col justify-center items-center px-8 py-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-6">College Coding Lab</h1>
          <p className="text-lg text-slate-300 mb-8">
            An advanced platform for coding exercises, anti-cheating monitoring, and performance tracking.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#1E293B] p-4 rounded-xl">
              <p className="text-2xl font-bold text-[#C9B88C] mb-1">Real-time</p>
              <p className="text-sm text-slate-400">Code editing & testing</p>
            </div>
            <div className="bg-[#1E293B] p-4 rounded-xl">
              <p className="text-2xl font-bold text-[#C9B88C] mb-1">Secure</p>
              <p className="text-sm text-slate-400">Anti-cheating monitoring</p>
            </div>
            <div className="bg-[#1E293B] p-4 rounded-xl">
              <p className="text-2xl font-bold text-[#C9B88C] mb-1">Instant</p>
              <p className="text-sm text-slate-400">Feedback & grading</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
