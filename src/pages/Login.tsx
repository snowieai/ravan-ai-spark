import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (id.toLowerCase() === 'danube' && password.toLowerCase() === 'danube') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', id);
        toast({
          title: "Login Successful!",
          description: "Welcome to Ravan AI",
        });
        navigate('/influencers');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid ID or password. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
              Login to Ravan AI
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id" className="text-gray-700 font-medium">
                  User ID
                </Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="Enter your ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
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
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Demo credentials: ID = "danube", Password = "danube"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;