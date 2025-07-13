import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowRight, Home, LogOut, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MayraIdeas = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (!isLoggedIn || selectedInfluencer !== 'mayra') {
      navigate('/');
    }
  }, [navigate]);

  const generateIdeas = async () => {
    setIsLoading(true);
    try {
      console.log('Generating ideas for Mayra...');
      
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook-test/31fda247-1f1b-48ac-8d53-50e26cb92728?action=generate_ideas&influencer=mayra`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ideas response:', data);
      
      if (data.ideas) {
        // Parse ideas from the response, handling different formats
        let parsedIdeas = [];
        if (Array.isArray(data.ideas)) {
          parsedIdeas = data.ideas;
        } else if (typeof data.ideas === 'string') {
          // Split by common delimiters and clean up
          parsedIdeas = data.ideas
            .split(/\n+|\*\*|\d+\./)
            .map(idea => idea.trim())
            .filter(idea => idea && idea.length > 10)
            .map(idea => {
              // Remove leading numbers, asterisks, and category labels
              return idea
                .replace(/^\d+\.\s*/, '')
                .replace(/^\*+\s*/, '')
                .replace(/^[-•]\s*/, '')
                .replace(/^\([^)]*\)\s*/, '')
                .replace(/^Category:\s*[^:]*:\s*/i, '')
                .trim();
            });
        }
        
        setIdeas(parsedIdeas.slice(0, 6)); // Limit to 6 ideas
        toast({
          title: "Ideas Generated!",
          description: `Generated ${parsedIdeas.length} creative ideas for Mayra.`,
        });
      } else {
        throw new Error('No ideas received from the API');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectIdea = (idea: string) => {
    localStorage.setItem('selectedIdea', idea);
    localStorage.setItem('selectedInfluencer', 'mayra');
    navigate('/mayra-script');
  };

  const handleBackToDashboard = () => {
    navigate('/mayra-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedInfluencer');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-yellow-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="flex items-center border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
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
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gray-900">Mayra's </span>
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Creative Ideas
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              Generate AI-powered video ideas tailored for Mayra's content style
            </p>
            
            <Button
              onClick={generateIdeas}
              disabled={isLoading}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Generate New Ideas
                </>
              )}
            </Button>
          </div>

          {/* Ideas Grid */}
          {ideas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ideas.map((idea, index) => (
                <Card 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-yellow-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
                  onClick={() => selectIdea(idea)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Idea {index + 1}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
                      {idea}
                    </p>
                    
                    <Button
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectIdea(idea);
                      }}
                    >
                      Create Script
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {ideas.length === 0 && !isLoading && (
            <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to Generate Ideas?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Click the button above to generate creative video ideas tailored for Mayra's content style.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MayraIdeas;