import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Lightbulb, ArrowRight, Loader2, Sparkles, ArrowLeft, Calendar, Plus, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const KairaIdeas = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const navigate = useNavigate();

  const generateIdeas = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://n8n.srv905291.hstgr.cloud/webhook/3205b796-624b-450a-b2e5-54dec2d3a73e?message=Generating Ideas', {
        method: 'GET',
      });

      const data = await response.json();
      
      // Parse ideas from the formatted output - same as Aisha's page
      const ideaMatches = data.output.match(/\*\d+\.\s*([^*]+)\*/g);
      if (ideaMatches) {
        const parsedIdeas = ideaMatches.map((match: string) => 
          match.replace(/\*\d+\.\s*/, '').replace(/\*$/, '').trim()
        );
        setIdeas(parsedIdeas);
        toast({
          title: "Ideas Generated!",
          description: `Kaira created ${parsedIdeas.length} creative ideas for you.`,
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
          description: `Kaira created ${fallbackIdeas.length} ideas for you.`,
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
    setIsLoading(true);
    setIsRegenerating(true);
    setLoadingProgress(0);
    
    // Simulate progress over 90 seconds (1.5 minutes)
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 1000);
    
    try {
      const response = await fetch('https://n8n.srv905291.hstgr.cloud/webhook/3205b796-624b-450a-b2e5-54dec2d3a73e?message=Regenerate', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.output) {
        throw new Error('Invalid response format from webhook');
      }
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Parse ideas from the formatted output - same as generate
      const ideaMatches = data.output.match(/\*\d+\.\s*([^*]+)\*/g);
      if (ideaMatches) {
        const parsedIdeas = ideaMatches.map((match: string) => 
          match.replace(/\*\d+\.\s*/, '').replace(/\*$/, '').trim()
        );
        
        // Add delay for completion animation
        setTimeout(() => {
          setIdeas(parsedIdeas);
          toast({
            title: "✨ Fresh Ideas Generated!",
            description: `Kaira created ${parsedIdeas.length} brand new ideas for you.`,
          });
        }, 500);
      } else {
        const lines = data.output.split('\n').filter((line: string) => 
          line.trim() && !line.startsWith('💡') && !line.startsWith('🏷️') && 
          !line.startsWith('👤') && !line.startsWith('🔗') && !line.startsWith('📝') && 
          !line.startsWith('👉') && line.includes('*')
        );
        const fallbackIdeas = lines.slice(0, 10);
        
        setTimeout(() => {
          setIdeas(fallbackIdeas);
          toast({
            title: "✨ Fresh Ideas Generated!",
            description: `Kaira created ${fallbackIdeas.length} brand new ideas for you.`,
          });
        }, 500);
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
        setIsLoading(false);
        setIsRegenerating(false);
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const selectIdea = (idea: string) => {
    localStorage.setItem('selectedIdea', idea);
    navigate('/kaira-script');
  };

  const scheduleIdea = async () => {
    if (!selectedIdea || !scheduledDate) return;

    try {
      const { error } = await supabase
        .from('content_calendar')
        .insert({
          topic: selectedIdea,
          scheduled_date: scheduledDate,
          status: 'planned',
          priority: 2,
          content_source: 'generated',
          category: 'Entertainment'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Idea added to content calendar",
      });

      setIsScheduleDialogOpen(false);
      setSelectedIdea('');
    } catch (error) {
      console.error('Error scheduling idea:', error);
      toast({
        title: "Error",
        description: "Failed to schedule idea",
        variant: "destructive",
      });
    }
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
          
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 mr-3 animate-spin text-orange-500" />
              <span className="text-xl text-gray-700">Kaira is thinking...</span>
            </div>
          )}
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
          <div className="max-w-6xl mx-auto animate-fade-in px-4 sm:px-0 pb-32">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              {isRegenerating ? "✨ Generating Fresh Ideas..." : "Kaira's Creative Ideas for You"}
            </h2>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ${isRegenerating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {ideas.map((idea, index) => (
                <Card 
                  key={`${idea}-${index}`}
                  className={`bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${!isRegenerating ? 'animate-scale-in' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-semibold text-lg mb-2">
                          Idea {index + 1}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                          {idea}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-3 pt-4 border-t border-orange-100">
                      <Button
                        onClick={() => selectIdea(idea)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
                      >
                        Select This Idea
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedIdea(idea)}
                            variant="outline"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Schedule Idea</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Selected Idea</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                                {selectedIdea}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Scheduled Date</label>
                              <Input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <Button 
                              onClick={scheduleIdea} 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Fixed position regenerate button */}
        {ideas.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <Card className="bg-white/95 backdrop-blur-md border-orange-200 shadow-2xl">
              <CardContent className="p-4">
                {isRegenerating && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-600">Kaira is creating fresh ideas...</span>
                      <span className="text-sm text-orange-600">{loadingProgress}%</span>
                    </div>
                    <Progress 
                      value={loadingProgress} 
                      className="h-2 bg-orange-100"
                    />
                  </div>
                )}
                <Button
                  onClick={regenerateIdeas}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 text-base rounded-full shadow-lg transform transition-all duration-200 border-0 ${!isLoading ? 'hover:scale-105 hover:shadow-xl' : ''} ${isRegenerating ? 'animate-pulse' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isRegenerating ? 'Regenerating...' : 'Loading...'}
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Regenerate AI-Ideas!
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
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