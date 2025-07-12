import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowLeft, LogOut, RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedText from '@/components/AnimatedText';

const BaileyIdeas = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (!isLoggedIn || selectedInfluencer !== 'bailey') {
      navigate('/');
      return;
    }

    // Load initial ideas
    loadIdeas();
  }, [navigate]);

  const loadIdeas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Generating Ideas'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }

      const data = await response.json();
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      } else if (data && typeof data === 'object') {
        const ideaValues = Object.values(data).filter(value => 
          typeof value === 'string' && value.trim().length > 0
        );
        if (ideaValues.length > 0) {
          setIdeas(ideaValues as string[]);
        } else {
          throw new Error('No valid ideas found in response');
        }
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast({
        title: "Error",
        description: "Failed to load ideas. Please try again.",
        variant: "destructive",
      });
      // Set fallback ideas
      setIdeas([
        "Share a virtual tour of a stunning waterfront property in Sydney",
        "Create a comparison post: Apartment vs House living in Melbourne", 
        "Showcase the best suburbs for families in Brisbane",
        "Tips for first-time home buyers in Australia",
        "Market trends: What's hot in Australian real estate right now"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setProgress(0);
    
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Regenerate'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate ideas');
      }

      const data = await response.json();
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      } else if (data && typeof data === 'object') {
        const ideaValues = Object.values(data).filter(value => 
          typeof value === 'string' && value.trim().length > 0
        );
        if (ideaValues.length > 0) {
          setIdeas(ideaValues as string[]);
        } else {
          throw new Error('No valid ideas found in response');
        }
      } else {
        throw new Error('Invalid response format');
      }

      setProgress(100);
      
      toast({
        title: "Ideas Regenerated!",
        description: "Fresh content ideas have been generated for Bailey.",
      });
      
    } catch (error) {
      console.error('Error regenerating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsRegenerating(false);
        setProgress(0);
      }, 1000);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Idea copied to clipboard.",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
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

  const handleBackToDashboard = () => {
    navigate('/bailey-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-teal-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 pb-32">
        {/* Bailey Profile Section */}
        <div className="text-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 w-full mx-auto shadow-lg border border-white/40 mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/lovable-uploads/a8037233-c2be-4b97-8739-3631486f9761.png" 
                alt="Bailey Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bailey</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium text-sm">Australia's Premier AI Real Estate Agent</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-emerald-500 p-3 rounded-2xl mr-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Content Ideas
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            AI-generated content ideas to boost your real estate social media presence
          </p>
        </div>

        {isLoading ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <p className="text-gray-600">Generating fresh ideas for Bailey...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {ideas.map((idea, index) => (
              <Card 
                key={index}
                className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-start justify-between">
                    <span className="flex-1">Idea {index + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(idea, index)}
                      className="ml-2 h-8 w-8 p-0 hover:bg-emerald-100"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-700 leading-relaxed">{idea}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {ideas.length === 0 && !isLoading && (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <Lightbulb className="w-full h-full" />
            </div>
            <p className="text-xl">No ideas generated yet.</p>
          </div>
        )}
      </div>

      {/* Regenerate Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold border-0 min-w-[200px]"
        >
          {isRegenerating ? (
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              <span>Regenerating... {Math.round(progress)}%</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              <span>Regenerate AI-Ideas!</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BaileyIdeas;