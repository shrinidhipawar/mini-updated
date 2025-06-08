import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Shield } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const adminRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  secretCode: z.string().min(1, "Secret code is required"),
});

type AdminRegisterData = z.infer<typeof adminRegisterSchema>;

export default function AdminRegisterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<AdminRegisterData>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      secretCode: "",
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
  
  const registerMutation = useMutation({
    mutationFn: async (data: AdminRegisterData) => {
      const res = await apiRequest("POST", "/api/admin/register", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin registration successful!",
        description: "You can now log in with your admin credentials",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: AdminRegisterData) {
    registerMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-700/50">
        <CardContent className="p-8 space-y-6">
          <div>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Admin Registration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Create an administrator account for the coding lab
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter admin email" 
                        autoComplete="email" 
                        className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-purple-500 rounded-lg"
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
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter admin password" 
                        autoComplete="new-password" 
                        className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-purple-500 rounded-lg"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secretCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Admin Secret Code</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter the admin secret code" 
                        className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-purple-500 rounded-lg"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg py-2 font-medium mt-6 shadow-lg hover:shadow-purple-500/25 transition-all duration-300" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating admin account...
                  </>
                ) : (
                  "Register as Admin"
                )}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}