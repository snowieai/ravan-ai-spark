
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, ArrowRight, Home, LogOut, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MayraIdeas = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (!isLoggedIn || selectedInfluencer !== 'mayra') {
      navigate('/');
      return;
    }

    // Load initial ideas automatically
    loadIdeas();
  }, [navigate]);

  const loadIdeas = async () => {
    setIsLoading(true);
    try {
      console.log('Loading ideas for Mayra...');
      
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Generating Ideas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('==================== MAYRA IDEAS WEBHOOK RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('======================================================================');
      
      // Process ideas from response
      let processedIdeas: string[] = [];
      let foundIdeas = false;
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        console.log('✅ Found direct ideas array with length:', data.ideas.length);
        processedIdeas = data.ideas;
        foundIdeas = true;
      } else if (data && data.ideas && typeof data.ideas === 'string') {
        console.log('✅ Found ideas as string, length:', data.ideas.length);
        const ideasText = data.ideas;
        processedIdeas = ideasText
          .split(/\n+|\d+\.\s+/)
          .map(idea => idea.trim())
          .filter(idea => idea && idea.length > 10)
          .map(idea => idea.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim());
        foundIdeas = true;
      } else if (data && typeof data === 'object') {
        console.log('🔍 Searching all fields for ideas...');
        
        const allValues = Object.values(data);
        console.log('All response values:', allValues);
        
        for (const value of allValues) {
          if (typeof value === 'string' && value.length > 50) {
            console.log('✅ Found text field with', value.length, 'characters');
            
            let extractedIdeas: string[] = [];
            
            if (value.includes('1.') || value.includes('1)')) {
              extractedIdeas = value
                .split(/\d+[\.\)]\s+/)
                .map(idea => idea.trim())
                .filter(idea => idea && idea.length > 10);
              console.log('Split by numbers, found:', extractedIdeas.length, 'ideas');
            }
            
            if (extractedIdeas.length < 3) {
              extractedIdeas = value
                .split(/\n+/)
                .map(idea => idea.trim())
                .filter(idea => idea && idea.length > 15 && !idea.match(/^\d+[\.\)]?\s*$/));
              console.log('Split by lines, found:', extractedIdeas.length, 'ideas');
            }
            
            if (extractedIdeas.length < 3) {
              extractedIdeas = value
                .split(/[-•*]\s+/)
                .map(idea => idea.trim())
                .filter(idea => idea && idea.length > 10);
              console.log('Split by bullets, found:', extractedIdeas.length, 'ideas');
            }
            
            if (extractedIdeas.length > 0) {
              processedIdeas = extractedIdeas.map(idea => {
                let cleanIdea = idea.replace(/^\d+[\.\)]\s*/, '').replace(/^\*+\s*/, '').replace(/\*+$/, '').trim();
                
                cleanIdea = cleanIdea
                  .replace(/\*?Category:?\*?.*$/i, '')
                  .replace(/\*?Type:?\*?.*$/i, '')
                  .replace(/\*?Genre:?\*?.*$/i, '')
                  .replace(/\*?\[.*?\]\*?/g, '')
                  .replace(/\*?\(.*?\)\*?/g, '')
                  .replace(/\*+/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                
                return cleanIdea;
              }).filter(idea => idea.length > 15 && !idea.toLowerCase().includes('sorted reel ideas'));
              foundIdeas = true;
              break;
            }
          }
        }
      }
      
      if (!foundIdeas) {
        console.log('🔄 No structured data found, using fallback ideas');
        processedIdeas = [
          "Create engaging content about your daily life",
          "Share tips for personal development", 
          "Showcase behind-the-scenes moments",
          "Educational content for your audience",
          "Trending topics in your niche"
        ];
        foundIdeas = true;
      }
      
      console.log('Final result - Found ideas:', foundIdeas);
      console.log('Ideas count:', processedIdeas.length);
      
      if (processedIdeas.length === 0) {
        throw new Error('No ideas could be extracted from response');
      }
      
      console.log('✅ Setting', processedIdeas.length, 'ideas in state');
      setIdeas(processedIdeas);
      
      toast({
        title: "Ideas Loaded!",
        description: `Generated ${processedIdeas.length} creative ideas for Mayra.`,
      });
    } catch (error) {
      console.error('❌ Error loading ideas:', error);
      toast({
        title: "Error",
        description: `Failed to load ideas: ${error.message}`,
        variant: "destructive",
      });
      // Set fallback ideas
      setIdeas([
        "Create engaging content about your daily life",
        "Share tips for personal development", 
        "Showcase behind-the-scenes moments",
        "Educational content for your audience",
        "Trending topics in your niche"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setProgress(0);
    
    // Animate progress over time like Kaira's
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 0.8;
      });
    }, 1000);
    
    try {
      console.log('Regenerating ideas for Mayra...');
      
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Regenerate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('==================== MAYRA REGENERATE WEBHOOK RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('======================================================================');
      
      // Handle different possible response formats
      let processedIdeas: string[] = [];
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        console.log('Format: Direct ideas array with length:', data.ideas.length);
        processedIdeas = data.ideas;
      } else if (data && typeof data === 'object') {
        const textFields = Object.values(data).filter(value => 
          typeof value === 'string' && value.length > 50
        );
        
        console.log('Found text fields:', textFields.length);
        
        if (textFields.length > 0) {
          const fullText = textFields[0] as string;
          console.log('Processing full text (first 200 chars):', fullText.substring(0, 200));
          
          let splitIdeas: string[] = [];
          
          if (fullText.includes('1.') && fullText.includes('2.')) {
            splitIdeas = fullText.split(/\d+\.\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by numbers - found', splitIdeas.length, 'ideas');
          }
          
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/\n+/).filter(idea => 
              idea.trim().length > 20 && !idea.match(/^\d+\.?\s*$/)
            );
            console.log('Split by lines - found', splitIdeas.length, 'ideas');
          }
          
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/[-•*]\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by bullets - found', splitIdeas.length, 'ideas');
          }
          
          processedIdeas = splitIdeas.map(idea => {
            let cleanIdea = idea.trim()
              .replace(/^\d+\.\s*/, '')
              .replace(/^[-•*]\s*/, '')
              .replace(/\n+/g, ' ')
              .trim();
            
            cleanIdea = cleanIdea
              .replace(/\*?Category:?\*?.*$/i, '')
              .replace(/\*?Type:?\*?.*$/i, '')
              .replace(/\*?Genre:?\*?.*$/i, '')
              .replace(/\*?\[.*?\]\*?/g, '')
              .replace(/\*?\(.*?\)\*?/g, '')
              .replace(/\*+/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (cleanIdea.includes(' vs ') && cleanIdea.length > 100) {
              cleanIdea = cleanIdea.split(' vs ')[0].trim();
            }
            
            return cleanIdea;
          }).filter(idea => idea.length > 15 && !idea.toLowerCase().includes('sorted reel ideas'));
          
          console.log('Final processed ideas count:', processedIdeas.length);
        } else {
          throw new Error('No text content found in response');
        }
      } else {
        throw new Error('Invalid response format - not an object');
      }
      
      if (processedIdeas.length === 0) {
        throw new Error('No ideas could be extracted from response');
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Animate out old ideas first
      setIdeas([]);
      
      // Then animate in new ideas after a brief delay
      setTimeout(() => {
        setIdeas(processedIdeas);
        toast({
          title: "New Ideas Generated!",
          description: `Generated ${processedIdeas.length} fresh creative ideas for Mayra.`,
        });
      }, 300);
      
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
        setProgress(0);
      }, 1000);
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
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-yellow-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-amber-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 pb-32">
        {/* Mayra Profile Section */}
        <div className="text-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 w-full mx-auto shadow-lg border border-white/40 mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/lovable-uploads/a97fae0f-f382-4663-afe8-7491cbcc07c9.png" 
                alt="Mayra Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Mayra</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium text-sm">Lifestyle & Personal Development Creator</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-500 p-3 rounded-2xl mr-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Creative Ideas
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            AI-generated content ideas tailored for Mayra's content style
          </p>
          
          {isLoading && ideas.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xl text-gray-700">Mayra is creating fresh ideas...</p>
            </div>
          )}
        </div>

        {/* Ideas Grid */}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mb-8">
            {ideas.map((idea, index) => (
              <Card 
                key={`${idea}-${index}`}
                className="bg-white/80 backdrop-blur-sm border-yellow-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 animate-scale-in group relative overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => selectIdea(idea)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Idea {index + 1}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed line-clamp-4">
                      {idea}
                    </p>
                  </div>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectIdea(idea);
                    }}
                  >
                    Use This Idea
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Progress Bar for Regeneration */}
        {isRegenerating && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-100 shadow-lg max-w-md mx-auto">
              <div className="text-center mb-4">
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Mayra is creating fresh ideas...
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round(progress)}% complete
                </p>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {ideas.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 mx-auto mb-8 opacity-70">
              <Lightbulb className="w-full h-full text-yellow-400" />
            </div>
            <p className="text-xl text-gray-500 mb-12 max-w-md mx-auto">Ready to generate creative ideas?</p>
            <Button
              onClick={loadIdeas}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-12 py-6 text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4 border-0 font-semibold"
            >
              <Lightbulb className="w-6 h-6" />
              <span>Generate AI Ideas</span>
            </Button>
          </div>
        )}
      </div>

      {/* Fixed Regenerate Button - Always Visible at Bottom Center */}
      {ideas.length > 0 && !isLoading && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 border border-yellow-100 shadow-2xl">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border-0 min-w-[220px] font-semibold"
            >
              {isRegenerating ? (
                <>
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </div>
                  <span>Regenerating... {Math.round(progress)}%</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Regenerate AI-Ideas!</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MayraIdeas;
