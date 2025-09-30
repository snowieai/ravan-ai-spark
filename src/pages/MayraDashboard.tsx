import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Video, Home, LogOut, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const MayraDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    // Auth check now handled by ProtectedRoute, only check influencer selection
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (selectedInfluencer !== 'mayra') {
      navigate('/influencers');
    }
  }, [navigate]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      localStorage.removeItem('selectedInfluencer');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    }
  };

  const handleBackToInfluencers = () => {
    navigate('/influencers');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-yellow-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToInfluencers}
              variant="outline"
              className="flex items-center border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Influencers
            </Button>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
                alt="Ravan.ai Logo" 
                className="h-12 w-auto"
              />
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-yellow-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-yellow-100 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="text-center py-12 px-8">
                <h1 className="text-4xl md:text-6xl font-bold mb-8">
                  <span className="text-gray-900">Welcome to </span>
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                    Mayra's Studio
                  </span>
                </h1>
                
                {/* Mayra's Image */}
                <div className="w-80 h-80 mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/lovable-uploads/a7454496-f5af-4ef2-91e0-7ab34585589e.png" 
                    alt="Mayra Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Description */}
                <div className="max-w-2xl mx-auto mb-12">
                  <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                    Meet <span className="font-semibold text-yellow-600">Mayra</span>, your AI video generation assistant powered by{' '}
                    <span className="font-semibold text-yellow-600">Ravan AI</span>.{' '}
                    <span className="text-amber-600 font-medium">
                      Transform your creative vision into stunning, professional-quality videos in minutes.
                    </span>
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => handleNavigation('/mayra-ideas')}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                  >
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Generate Ideas
                  </Button>

                  <Button
                    onClick={() => handleNavigation('/mayra-calendar')}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Content Calendar
                  </Button>
                  
                  <Button
                    onClick={() => toast({
                      title: "Coming Soon",
                      description: "AI Video creation will be available soon.",
                    })}
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 min-w-[250px]"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Create AI Video with Mayra
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MayraDashboard;