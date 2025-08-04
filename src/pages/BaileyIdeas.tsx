import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowLeft, LogOut, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedText from '@/components/AnimatedText';

const BaileyIdeas = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);

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
      const response = await fetch('https://n8n.srv905291.hstgr.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1?message=Generating Ideas', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }

      const data = await response.json();
      console.log('==================== BAILEY IDEAS WEBHOOK RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      console.log('======================================================================');
      
      // Handle different possible response formats
      let processedIdeas: string[] = [];
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        console.log('Format: Direct ideas array with length:', data.ideas.length);
        processedIdeas = data.ideas;
      } else if (data && typeof data === 'object') {
        // Check if response contains a single text field with all ideas
        const textFields = Object.values(data).filter(value => 
          typeof value === 'string' && value.length > 50
        );
        
        console.log('Found text fields:', textFields.length);
        
        if (textFields.length > 0) {
          const fullText = textFields[0] as string;
          console.log('Processing full text (first 200 chars):', fullText.substring(0, 200));
          
          // Try multiple splitting patterns to extract individual ideas
          let splitIdeas: string[] = [];
          
          // Pattern 1: Split by numbered list (1., 2., etc.)
          if (fullText.includes('1.') && fullText.includes('2.')) {
            splitIdeas = fullText.split(/\d+\.\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by numbers - found', splitIdeas.length, 'ideas');
          }
          
          // Pattern 2: Split by line breaks and filter for substantial content
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/\n+/).filter(idea => 
              idea.trim().length > 20 && !idea.match(/^\d+\.?\s*$/)
            );
            console.log('Split by lines - found', splitIdeas.length, 'ideas');
          }
          
          // Pattern 3: Split by bullet points or dashes
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/[-•*]\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by bullets - found', splitIdeas.length, 'ideas');
          }
          
          // Clean up the ideas - extract only the main title
          processedIdeas = splitIdeas.map(idea => {
            let cleanIdea = idea.trim()
              .replace(/^\d+\.\s*/, '') // Remove leading numbers
              .replace(/^[-•*]\s*/, '') // Remove leading bullets
              .replace(/\n+/g, ' ') // Replace line breaks with spaces
              .trim();
            
            // Extract just the main title before any category or extra info
            if (cleanIdea.includes('*Category:*')) {
              cleanIdea = cleanIdea.split('*Category:*')[0].trim();
            }
            
            // Remove any trailing asterisks or metadata
            cleanIdea = cleanIdea.replace(/\*+$/, '').trim();
            
            // If there's a pattern like "Title vs Title*" or "Title*", clean it
            if (cleanIdea.endsWith('*')) {
              cleanIdea = cleanIdea.slice(0, -1).trim();
            }
            
            return cleanIdea;
          }).filter(idea => idea.length > 15);
          
          console.log('Final processed ideas count:', processedIdeas.length);
          console.log('First 3 processed ideas:', processedIdeas.slice(0, 3));
        } else {
          throw new Error('No text content found in response');
        }
      } else {
        throw new Error('Invalid response format - not an object');
      }
      
      if (processedIdeas.length === 0) {
        throw new Error('No ideas could be extracted from response');
      }
      
      console.log('Setting', processedIdeas.length, 'ideas in state');
      setIdeas(processedIdeas);
      
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
    
    // Animate progress over 2 minutes (120 seconds)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 0.8; // Slower progress for 2 minute duration
      });
    }, 1000); // Update every second

    try {
      const response = await fetch('https://n8n.srv905291.hstgr.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1?message=Regenerate', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate ideas');
      }

      const data = await response.json();
      console.log('==================== BAILEY REGENERATE WEBHOOK RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('======================================================================');
      
      // Handle different possible response formats
      let processedIdeas: string[] = [];
      
      if (data && data.ideas && Array.isArray(data.ideas)) {
        console.log('Format: Direct ideas array with length:', data.ideas.length);
        processedIdeas = data.ideas;
      } else if (data && typeof data === 'object') {
        // Check if response contains a single text field with all ideas
        const textFields = Object.values(data).filter(value => 
          typeof value === 'string' && value.length > 50
        );
        
        console.log('Found text fields:', textFields.length);
        
        if (textFields.length > 0) {
          const fullText = textFields[0] as string;
          console.log('Processing full text (first 200 chars):', fullText.substring(0, 200));
          
          // Try multiple splitting patterns to extract individual ideas
          let splitIdeas: string[] = [];
          
          // Pattern 1: Split by numbered list (1., 2., etc.)
          if (fullText.includes('1.') && fullText.includes('2.')) {
            splitIdeas = fullText.split(/\d+\.\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by numbers - found', splitIdeas.length, 'ideas');
          }
          
          // Pattern 2: Split by line breaks and filter for substantial content
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/\n+/).filter(idea => 
              idea.trim().length > 20 && !idea.match(/^\d+\.?\s*$/)
            );
            console.log('Split by lines - found', splitIdeas.length, 'ideas');
          }
          
          // Pattern 3: Split by bullet points or dashes
          if (splitIdeas.length < 5) {
            splitIdeas = fullText.split(/[-•*]\s+/).filter(idea => idea.trim().length > 10);
            console.log('Split by bullets - found', splitIdeas.length, 'ideas');
          }
          
          // Clean up the ideas - extract only the main title
          processedIdeas = splitIdeas.map(idea => {
            let cleanIdea = idea.trim()
              .replace(/^\d+\.\s*/, '') // Remove leading numbers
              .replace(/^[-•*]\s*/, '') // Remove leading bullets
              .replace(/\n+/g, ' ') // Replace line breaks with spaces
              .trim();
            
            // Extract just the main title before any category or extra info
            if (cleanIdea.includes('*Category:*')) {
              cleanIdea = cleanIdea.split('*Category:*')[0].trim();
            }
            
            // Remove any trailing asterisks or metadata
            cleanIdea = cleanIdea.replace(/\*+$/, '').trim();
            
            // If there's a pattern like "Title vs Title*" or "Title*", clean it
            if (cleanIdea.endsWith('*')) {
              cleanIdea = cleanIdea.slice(0, -1).trim();
            }
            
            return cleanIdea;
          }).filter(idea => idea.length > 15);
          
          console.log('Final processed ideas count:', processedIdeas.length);
          console.log('First 3 processed ideas:', processedIdeas.slice(0, 3));
        } else {
          throw new Error('No text content found in response');
        }
      } else {
        throw new Error('Invalid response format - not an object');
      }
      
      if (processedIdeas.length === 0) {
        throw new Error('No ideas could be extracted from response');
      }
      
      console.log('Setting', processedIdeas.length, 'ideas in state');
      setIdeas(processedIdeas);

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

  const handleUseIdea = (idea: string) => {
    localStorage.setItem('selectedIdea', idea);
    navigate('/bailey-script');
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
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Idea {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-700 leading-relaxed mb-4">{idea}</p>
                  <Button
                    onClick={() => handleUseIdea(idea)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Use this Idea!
                  </Button>
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

      {/* Regenerate Button - Centered at Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
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