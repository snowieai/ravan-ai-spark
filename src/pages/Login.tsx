import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, Eye, EyeOff, UserPlus, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthHealth, isEmbedded } from '@/lib/supabase-utils';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password must be less than 100 characters" })
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" })
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbedded());
    supabaseAuthHealth()
      .then((h) => setHealthOk(h.ok))
      .catch(() => setHealthOk(false));
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/influencers');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors({});

    try {

      // Preflight: ensure Supabase Auth is reachable
      const health = await supabaseAuthHealth();
      if (!health.ok) {
        const suggestion = embedded
          ? 'Open the app in a new tab and try again.'
          : 'Check your network or run diagnostics.';
        toast({
          title: 'Connection Error',
          description: `Supabase Auth is unreachable. ${suggestion}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        signupSchema.parse({ email, password, fullName });
        const { error } = await signUp(email, password, fullName, isAdmin);
        if (error) {
          console.error('Signup error details:', {
            message: error.message,
            status: error.status,
            details: error.details
          });
          
          let errorMessage = error.message;
          let errorTitle = "Sign Up Failed";
          
          // Improved error handling for common issues
          if (error.message?.includes('fetch') || error.message?.includes('Network')) {
            errorTitle = "Connection Error";
            errorMessage = "Network connection failed. Please check your internet connection or try running diagnostics.";
          } else if (error.message?.includes('Invalid') && error.message?.includes('redirect')) {
            errorTitle = "Configuration Error";
            errorMessage = "Authentication redirect configuration issue. Please contact support.";
          } else if (error.message?.includes('confirm email')) {
            errorTitle = "Email Confirmation Required";
            errorMessage = "Please check your email and click the confirmation link before signing in.";
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Successful!",
            description: "Please check your email to confirm your account.",
          });
          setIsSignUp(false);
        }
      } else {
        loginSchema.parse({ email, password });
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Login error details:', {
            message: error.message,
            status: error.status,
            details: error.details
          });
          
          let errorMessage = error.message;
          let errorTitle = "Login Failed";
          
          if (error.message?.includes('fetch') || error.message?.includes('Network')) {
            errorTitle = "Connection Error";
            errorMessage = "Network connection failed. Please check your internet connection or try running diagnostics.";
          } else if (error.message?.includes('Invalid login credentials')) {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Successful!",
            description: "Welcome to Ravan AI",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { email?: string; password?: string; fullName?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0] === 'email') errors.email = err.message;
          if (err.path[0] === 'password') errors.password = err.message;
          if (err.path[0] === 'fullName') errors.fullName = err.message;
        });
        setValidationErrors(errors);
      } else {
        console.error('Unexpected error:', error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again or run diagnostics.",
          variant: "destructive",
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
                alt="Ravan.ai Logo" 
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Sign Up for Ravan AI' : 'Login to Ravan AI'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Create your account to get started' : 'Enter your credentials to access your account'}
            </p>
          </CardHeader>
          
          <CardContent>
            {embedded && healthOk === false && (
              <div className="mb-4 p-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900">
                <p className="text-sm mb-2">Requests may be blocked in embedded preview. Open the app in a new tab to continue.</p>
                <Button type="button" size="sm" variant="outline" onClick={() => window.open(window.location.href, '_blank')}>
                  Open in new tab
                </Button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-500"
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-600">{validationErrors.fullName}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-orange-200 focus:border-orange-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {isSignUp && (
                <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg">
                  <Checkbox
                    id="admin"
                    checked={isAdmin}
                    onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
                    className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label htmlFor="admin" className="text-sm text-gray-700 cursor-pointer font-medium">
                    Are you an Admin? (Will you be approving scripts and content?)
                  </label>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'Creating Account...' : 'Logging in...'}
                  </div>
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                    {isSignUp ? 'Sign Up' : 'Login'}
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Link 
                to="/diagnostics" 
                className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors"
              >
                <Settings className="w-4 h-4 mr-1" />
                Having trouble? Run diagnostics
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-600 hover:text-orange-700"
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;