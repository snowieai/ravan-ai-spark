
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Ideas = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateIdeas = async () => {
    setIsLoading(true);
    console.log("Generating ideas via webhook...");
    
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook-test/837c4cfe-e8c9-4243-9e02-2d2872b87417', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'Generating ideas'
        }),
      });

      const data = await response.json();
      console.log("Webhook response:", data);
      
      // Parse ideas using regex
      const ideaMatches = data.output.match(/topic:\s*(.+)/g);
      if (ideaMatches) {
        const parsedIdeas = ideaMatches.map((match: string) => 
          match.replace(/topic:\s*/, '').trim()
        );
        setIdeas(parsedIdeas);
        toast({
          title: "Ideas Generated!",
          description: `Found ${parsedIdeas.length} creative ideas for you.`,
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

  const selectIdea = (idea: string) => {
    console.log("Selected idea:", idea);
    // Store the selected idea and navigate to script page
    localStorage.setItem('selectedIdea', idea);
    navigate('/script');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Lightbulb className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              AI Ideas Generator
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let AI spark your creativity with unique video ideas tailored for your content
          </p>
          
          <Button
            onClick={generateIdeas}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="w-6 h-6 mr-2" />
                Generate Ideas
              </>
            )}
          </Button>
        </div>

        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {ideas.map((idea, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                onClick={() => selectIdea(idea)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        Idea {index + 1}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {idea}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                    >
                      Use This Idea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {ideas.length === 0 && !isLoading && (
          <div className="text-center text-gray-400">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <Lightbulb className="w-full h-full" />
            </div>
            <p className="text-xl">Click the button above to generate creative ideas!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ideas;
