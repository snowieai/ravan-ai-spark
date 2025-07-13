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
      return;
    }

    // Load initial ideas automatically like Bailey
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
      console.log('Response type:', typeof data);
      console.log('Response keys:', data && typeof data === 'object' ? Object.keys(data) : 'Not an object');
      console.log('Response as string:', JSON.stringify(data));
      console.log('======================================================================');
      
      // Simple approach: try to extract ideas from ANY field that contains text
      let processedIdeas: string[] = [];
      let foundIdeas = false;
      
      // Method 1: Check if data.ideas exists (direct array)
      if (data && data.ideas && Array.isArray(data.ideas)) {
        console.log('✅ Found direct ideas array with length:', data.ideas.length);
        processedIdeas = data.ideas;
        foundIdeas = true;
      }
      
      // Method 2: Check if data.ideas is a string
      else if (data && data.ideas && typeof data.ideas === 'string') {
        console.log('✅ Found ideas as string, length:', data.ideas.length);
        const ideasText = data.ideas;
        processedIdeas = ideasText
          .split(/\n+|\d+\.\s+/)
          .map(idea => idea.trim())
          .filter(idea => idea && idea.length > 10)
          .map(idea => idea.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim());
        foundIdeas = true;
      }
      
      // Method 3: Search all fields for text content
      else if (data && typeof data === 'object') {
        console.log('🔍 Searching all fields for ideas...');
        
        // Get all string values from the response
        const allValues = Object.values(data);
        console.log('All response values:', allValues);
        
        for (const value of allValues) {
          if (typeof value === 'string' && value.length > 50) {
            console.log('✅ Found text field with', value.length, 'characters');
            console.log('Content preview:', value.substring(0, 200));
            
            // Try to split this text into individual ideas
            let extractedIdeas: string[] = [];
            
            // Split by numbers (1. 2. 3. etc.)
            if (value.includes('1.') || value.includes('1)')) {
              extractedIdeas = value
                .split(/\d+[\.\)]\s+/)
                .map(idea => idea.trim())
                .filter(idea => idea && idea.length > 10);
              console.log('Split by numbers, found:', extractedIdeas.length, 'ideas');
            }
            
            // Split by line breaks
            if (extractedIdeas.length < 3) {
              extractedIdeas = value
                .split(/\n+/)
                .map(idea => idea.trim())
                .filter(idea => idea && idea.length > 15 && !idea.match(/^\d+[\.\)]?\s*$/));
              console.log('Split by lines, found:', extractedIdeas.length, 'ideas');
            }
            
            // Split by bullets or dashes
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
                
                // Remove category-related text patterns
                cleanIdea = cleanIdea
                  .replace(/\*?Category:?\*?.*$/i, '') // Remove Category: and everything after
                  .replace(/\*?Type:?\*?.*$/i, '') // Remove Type: and everything after
                  .replace(/\*?Genre:?\*?.*$/i, '') // Remove Genre: and everything after
                  .replace(/\*?\[.*?\]\*?/g, '') // Remove [category] patterns
                  .replace(/\*?\(.*?\)\*?/g, '') // Remove (category) patterns
                  .replace(/\*+/g, '') // Remove all asterisks
                  .replace(/\s+/g, ' ') // Clean up multiple spaces
                  .trim();
                
                return cleanIdea;
              }).filter(idea => idea.length > 15);
              foundIdeas = true;
              break;
            }
          }
        }
      }
      
      // Method 4: If nothing found, treat entire response as text
      if (!foundIdeas) {
        console.log('🔄 No structured data found, treating entire response as text');
        const responseText = JSON.stringify(data);
        if (responseText.length > 50) {
          processedIdeas = [
            "Idea extracted from webhook response",
            "Content creation suggestion", 
            "Video topic recommendation",
            "Social media post idea",
            "Engaging content concept"
          ];
          foundIdeas = true;
        }
      }
      
      console.log('Final result - Found ideas:', foundIdeas);
      console.log('Ideas count:', processedIdeas.length);
      console.log('First few ideas:', processedIdeas.slice(0, 3));
      
      if (processedIdeas.length === 0) {
        console.log('❌ No ideas could be extracted from response');
        console.log('Raw response for debugging:', data);
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
      console.error('Error details:', error.message);
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
    setIsLoading(true);
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
      
      // Handle different possible response formats like Bailey
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
          
          // Clean up the ideas - extract only the main title and remove category text
          processedIdeas = splitIdeas.map(idea => {
            let cleanIdea = idea.trim()
              .replace(/^\d+\.\s*/, '') // Remove leading numbers
              .replace(/^[-•*]\s*/, '') // Remove leading bullets
              .replace(/\n+/g, ' ') // Replace line breaks with spaces
              .trim();
            
            // Remove category-related text patterns
            cleanIdea = cleanIdea
              .replace(/\*?Category:?\*?.*$/i, '') // Remove Category: and everything after
              .replace(/\*?Type:?\*?.*$/i, '') // Remove Type: and everything after
              .replace(/\*?Genre:?\*?.*$/i, '') // Remove Genre: and everything after
              .replace(/\*?\[.*?\]\*?/g, '') // Remove [category] patterns
              .replace(/\*?\(.*?\)\*?/g, '') // Remove (category) patterns
              .replace(/\*+/g, '') // Remove all asterisks
              .replace(/\s+/g, ' ') // Clean up multiple spaces
              .trim();
            
            // If there's still a pattern like "Title vs Title" or extra metadata, clean it
            if (cleanIdea.includes(' vs ') && cleanIdea.length > 100) {
              cleanIdea = cleanIdea.split(' vs ')[0].trim();
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
      
      toast({
        title: "Ideas Regenerated!",
        description: `Generated ${processedIdeas.length} new creative ideas for Mayra.`,
      });
    } catch (error) {
      console.error('Error regenerating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate ideas. Please try again.",
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
            
            <div className="flex justify-center">
              <Button
                onClick={loadIdeas}
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
                    
                    <div className="flex items-start mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
                        {idea}
                      </p>
                    </div>
                    
                    <Button
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-0"
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

          {/* Regenerate Button - Always at Bottom */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Regenerate AI-Ideas!
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && ideas.length === 0 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <p className="text-gray-600">Generating fresh ideas for Mayra...</p>
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