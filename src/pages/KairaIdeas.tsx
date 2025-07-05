import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowRight, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Idea {
  title: string;
  description: string;
}

interface IdeaResponse {
  ideas: Idea[];
}

const KairaIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateIdeas = async () => {
    setIsLoading(true);
    console.log("Generating ideas for Kaira...");
    
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook-test/3205b796-624b-450a-b2e5-54dec2d3a73e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: "Generating ideas"
        }),
      });

      const data = await response.json();
      console.log("Kaira ideas webhook response:", data);
      
      if (data.output && Array.isArray(data.output.ideas)) {
        setIdeas(data.output.ideas);
        toast({
          title: "Ideas Generated!",
          description: `Kaira created ${data.output.ideas.length} creative ideas for you.`,
        });
      } else {
        throw new Error('Invalid response format');
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

  const selectIdea = (idea: Idea) => {
    localStorage.setItem('selectedIdea', `${idea.title}: ${idea.description}`);
    navigate('/script');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/kaira-dashboard')}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Kaira's Studio</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <img 
              src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
              alt="Ravan.ai Logo" 
              className="h-8 sm:h-12 w-auto"
            />
            <div className="w-16 sm:w-32"></div>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-orange-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-amber-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="bg-orange-500 p-2 sm:p-3 rounded-2xl mb-3 sm:mb-0 sm:mr-4">
              <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 text-center">
              Kaira's Idea Generator
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Let Kaira spark your creativity with AI-powered video content ideas
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8 sm:mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg mx-4 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <Button
                onClick={generateIdeas}
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                    Kaira is thinking...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Generate Ideas with Kaira
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {ideas.length > 0 && (
          <div className="max-w-6xl mx-auto animate-fade-in px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              Kaira's Creative Ideas for You
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {ideas.map((idea, index) => (
                <Card 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
                  onClick={() => selectIdea(idea)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900 text-lg sm:text-xl flex items-start">
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-orange-500 flex-shrink-0 mt-1" />
                      <span className="line-clamp-2">{idea.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 flex flex-col h-full">
                    <p className="text-gray-600 mb-4 flex-grow text-sm sm:text-base leading-relaxed">
                      {idea.description}
                    </p>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 mt-auto group-hover:scale-105 transition-transform rounded-full py-3 px-4 text-sm sm:text-base font-medium"
                    >
                      Use this idea
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {ideas.length === 0 && !isLoading && (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <Lightbulb className="w-full h-full" />
            </div>
            <p className="text-xl">Click the button above to let Kaira generate amazing ideas for you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KairaIdeas;