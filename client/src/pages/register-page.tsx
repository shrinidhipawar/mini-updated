import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
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
  
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "You can now log in with your credentials",
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
  
  function onSubmit(values: RegisterData) {
    registerMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#F9F8F6]">
      <Card className="max-w-md w-full bg-white shadow-sm rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <div>
            <h2 className="mt-2 text-center text-3xl font-serif font-medium text-[#1F2937]">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Register to access the coding lab environment
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1F2937]">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
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
                        autoComplete="new-password" 
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
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg py-2 font-medium mt-6" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#0F172A] hover:underline font-medium">
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