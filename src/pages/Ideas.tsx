import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, ArrowRight, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Ideas = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  // Auto-generate ideas when component mounts
  useEffect(() => {
    generateIdeas();
  }, []);

  const generateIdeas = async () => {
    setIsLoading(true);
    console.log("Generating ideas via webhook...");
    
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook/9562157b-c2d8-4e1f-a79e-03bd7c3337a2?message=Generating ideas', {
        method: 'GET',
      });

      const data = await response.json();
      console.log("Webhook response:", data);
      
      // Parse ideas from the formatted output
      const ideaMatches = data.output.match(/\*\d+\.\s*([^*]+)\*/g);
      if (ideaMatches) {
        const parsedIdeas = ideaMatches.map((match: string) => 
          match.replace(/\*\d+\.\s*/, '').replace(/\*$/, '').trim()
        );
        setIdeas(parsedIdeas);
        toast({
          title: "Ideas Generated!",
          description: `Found ${parsedIdeas.length} creative ideas for you.`,
        });
      } else {
        const lines = data.output.split('\n').filter((line: string) => 
          line.trim() && !line.startsWith('💡') && !line.startsWith('🏷️') && 
          !line.startsWith('👤') && !line.startsWith('🔗') && !line.startsWith('📝') && 
          !line.startsWith('👉') && line.includes('*')
        );
        const fallbackIdeas = lines.slice(0, 10);
        setIdeas(fallbackIdeas);
        toast({
          title: "Ideas Generated!",
          description: `Found ${fallbackIdeas.length} ideas for you.`,
        });
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

  const regenerateIdeas = async () => {
    setIsRegenerating(true);
    setLoadingProgress(0);
    console.log("Regenerating ideas via webhook...");
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 10;
      });
    }, 2000);
    
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook/9562157b-c2d8-4e1f-a79e-03bd7c3337a2?message=Regenerate', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Aisha regenerate webhook response:", data);
      
      if (!data || !data.output) {
        throw new Error('Invalid response format from webhook');
      }
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Parse ideas from the formatted output
      const ideaMatches = data.output.match(/\*\d+\.\s*([^*]+)\*/g);
      if (ideaMatches) {
        const parsedIdeas = ideaMatches.map((match: string) => 
          match.replace(/\*\d+\.\s*/, '').replace(/\*$/, '').trim()
        );
        
        // Animate out old ideas first
        setIdeas([]);
        
        // Then animate in new ideas after a brief delay
        setTimeout(() => {
          setIdeas(parsedIdeas);
          toast({
            title: "New Ideas Generated!",
            description: `Generated ${parsedIdeas.length} fresh creative ideas for you.`,
          });
        }, 300);
      } else {
        const lines = data.output.split('\n').filter((line: string) => 
          line.trim() && !line.startsWith('💡') && !line.startsWith('🏷️') && 
          !line.startsWith('👤') && !line.startsWith('🔗') && !line.startsWith('📝') && 
          !line.startsWith('👉') && line.includes('*')
        );
        const fallbackIdeas = lines.slice(0, 10);
        
        // Animate out old ideas first
        setIdeas([]);
        
        // Then animate in new ideas after a brief delay
        setTimeout(() => {
          setIdeas(fallbackIdeas);
          toast({
            title: "New Ideas Generated!",
            description: `Generated ${fallbackIdeas.length} fresh ideas for you.`,
          });
        }, 300);
      }
    } catch (error) {
      console.error('Error regenerating ideas:', error);
      clearInterval(progressInterval);
      toast({
        title: "Error",
        description: "Failed to regenerate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsRegenerating(false);
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const selectIdea = (idea: string) => {
    console.log("Selected idea:", idea);
    localStorage.setItem('selectedIdea', idea);
    navigate('/script');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/aisha-dashboard')}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Aisha's Studio
            </Button>
            <img 
              src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
              alt="Ravan.ai Logo" 
              className="h-12 w-auto"
            />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-blue-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-purple-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-500 p-3 rounded-2xl mr-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              AI Ideas Generator
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Aisha is generating creative video ideas tailored for your content
          </p>
          
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 mr-3 animate-spin text-blue-500" />
              <span className="text-xl text-gray-700">Generating ideas...</span>
            </div>
          )}
        </div>

        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mb-32">
            {ideas.map((idea, index) => (
              <Card 
                key={`${idea}-${index}`}
                className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 animate-scale-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => selectIdea(idea)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold text-lg mb-2">
                        Idea {index + 1}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {idea}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-full"
                    >
                      Use This Idea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fixed Regenerate Button */}
        {ideas.length > 0 && !isLoading && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              onClick={regenerateIdeas}
              disabled={isRegenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border-0 min-w-[200px]"
            >
              {isRegenerating ? (
                <>
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"
                      style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'white',
                        borderBottomColor: 'white',
                        borderLeftColor: 'white',
                      }}
                    ></div>
                  </div>
                  <span>Regenerating... {Math.round(loadingProgress)}%</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Regenerate AI-Ideas!</span>
                </>
              )}
            </Button>
          </div>
        )}

        {ideas.length === 0 && !isLoading && (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <Lightbulb className="w-full h-full" />
            </div>
            <p className="text-xl">No ideas generated yet. Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ideas;
