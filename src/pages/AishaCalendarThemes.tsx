import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SparklesCore } from '@/components/ui/sparkles';
import { 
  ArrowLeft, 
  User, 
  Building, 
  TrendingUp, 
  DollarSign, 
  HelpCircle, 
  Globe, 
  Coffee,
  Sun,
  Lightbulb,
  RefreshCw,
  MessageSquare,
  Newspaper,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ThemeDay {
  day: string;
  theme: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  summary: string;
  detailedContent: string;
  videoStyle: string;
  duration: string;
  targetAudience: string;
  type?: string;
  sourceUrl?: string;
}

const AishaCalendarThemes = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<GeneratedIdea | null>(null);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🎯 AishaCalendarThemes render state:', { 
    selectedTheme, 
    isLoading, 
    ideasLength: ideas.length,
    ideas: ideas.map(idea => ({ id: idea.id, title: idea.title }))
  });

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  const themeDays: ThemeDay[] = [
    {
      day: 'Monday',
      theme: 'Real Estate Interactive',
      description: 'Create engaging polls, interactive quizzes, "Did You Know?" facts, and informative infographics. Encourage audience participation to make real estate knowledge fun and easy to digest.',
      icon: MessageSquare,
      color: 'from-red-500 to-red-600'
    },
    {
      day: 'Wednesday',
      theme: 'Real Estate News',
      description: 'Share the latest real estate updates, market trends, property launches, government regulations, and investment insights specific to each region. Content should be accurate, timely, and positioned as a trusted industry resource.',
      icon: Newspaper,
      color: 'from-green-500 to-green-600'
    },
    {
      day: 'Friday',
      theme: 'Trending (Country-wise)',
      description: 'Identify trending topics in real estate, lifestyle, economy, and tech that connect with your audience. Create quick-turnaround posts (carousels, reels, or shorts) to capitalize on hot conversations.',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      day: 'Saturday',
      theme: 'Viral Content',
      description: 'Research and share trending, humorous, or emotionally engaging stories relevant to each region. Focus on content that resonates culturally and is highly shareable.',
      icon: Zap,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getFallbackIdeas = (day: string, theme: string): GeneratedIdea[] => {
    const fallbackTemplates = [
      "Market Update: Share current trends and statistics",
      "Property Showcase: Highlight a featured listing",
      "Client Success Story: Share a recent testimonial",
      "Educational Tip: Provide valuable real estate advice",
      "Behind the Scenes: Show your daily work process",
      "Community Spotlight: Feature local businesses or events",
      "Q&A Session: Answer common buyer/seller questions",
      "Virtual Tour: Take viewers through a property",
      "Professional Insight: Share industry expertise",
      "Call to Action: Encourage engagement or consultations"
    ];
    
    return fallbackTemplates.map((template, index) => ({
      id: `${day.toLowerCase()}-fallback-${index + 1}`,
      title: `${theme} - ${template}`,
      description: `Create engaging content around: ${template.toLowerCase()}`,
      summary: `A ${theme.toLowerCase()} themed post focusing on ${template.toLowerCase()}`,
      detailedContent: `**${template}**\n\nThis is a fallback idea for ${theme} themed content. Focus on creating valuable, engaging content that resonates with your audience while staying true to the ${theme.toLowerCase()} theme.\n\n**Content suggestions:**\n- Keep it authentic and relatable\n- Use high-quality visuals\n- Include a clear call-to-action\n- Engage with your audience in comments`,
      videoStyle: "Professional",
      duration: "60 seconds",
      targetAudience: "Real estate professionals"
    }));
  };

  const sendDayWebhook = async (day: string) => {
    const normalizedDay = day.toLowerCase();
    console.log(`🚀 Making SINGLE webhook GET request for Aisha with day: ${normalizedDay}`);
    
    const webhookUrl = `https://n8n.srv905291.hstgr.cloud/webhook/de6a2655-e54f-4201-8042-99928cd26b4b?day=${encodeURIComponent(normalizedDay)}`;
    console.log(`📤 FULL URL BEING CALLED: ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(300000) // 5 minute timeout
    });

    console.log(`📨 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Webhook HTTP error:`, response.status, errorText);
      throw new Error(`Webhook HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.text();
    console.log(`📥 FULL webhook response:`, responseData);
    
    // Parse and return ideas (reuse parsing logic from Kaira)
    const cleanedText = responseData
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .replace(/```/g, '')
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanedText);
      console.log('🔍 Initial parse result type:', typeof parsed, 'isArray:', Array.isArray(parsed));
    } catch {
      parsed = null;
      console.log('❌ Initial JSON.parse failed');
    }

    // Parse ideas from response
    if (Array.isArray(parsed)) {
      return parsed.map((item: any, index: number) => ({
        id: `aisha-idea-${index}`,
        title: item.title || `Idea ${index + 1}`,
        description: item.description || item.summary || 'No description',
        summary: item.summary || item.description || 'No summary',
        detailedContent: item.detailedContent || item.summary || 'No details',
        videoStyle: 'Professional',
        duration: '60-90 seconds',
        targetAudience: 'Real Estate Professionals & Clients',
        type: item.type || 'INFORMATION',
        sourceUrl: item.sourceUrl || item.source_url || ''
      }));
    }

    return [];
  };

  const generateThemedIdeas = async (theme: string, day: string) => {
    console.log('🎯 generateThemedIdeas called for Aisha', { theme, day });
    
    setIsLoading(true);
    setSelectedTheme(theme);
    
    try {
      console.log('📞 Making webhook call for Aisha with day:', day);
      const webhookIdeas = await sendDayWebhook(day);
      console.log('✅ Webhook response received:', webhookIdeas.length, 'ideas');
      
      setIdeas(webhookIdeas);
      console.log('🎯 setIdeas called with length:', webhookIdeas.length);
      
      toast.success(`Generated ${webhookIdeas.length} themed ideas successfully!`);
      
    } catch (error: any) {
      console.error('❌ Webhook request completely failed:', error);
      console.log('🔄 Network/timeout error - using fallback ideas');
      
      const fallbackIdeas = getFallbackIdeas(day, theme);
      setIdeas(fallbackIdeas);
      
      toast.error(`Webhook request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🎯 setIsLoading(false) called');
    }
  };

  const selectIdea = (idea: GeneratedIdea) => {
    localStorage.setItem('selectedIdeaAisha', JSON.stringify(idea));
    navigate('/aisha-script');
  };

  const groupIdeasByType = (ideas: GeneratedIdea[]) => {
    if (selectedTheme === 'Real Estate News') {
      console.log(`[Wednesday] Skipping type grouping. Total ideas: ${ideas.length}`);
      return { 'All Ideas': ideas };
    }
    
    const grouped: { [key: string]: GeneratedIdea[] } = {};
    ideas.forEach(idea => {
      const key = idea.type || 'INFORMATION';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(idea);
    });
    
    return grouped;
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'INFORMATION':
        return { icon: Info, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' };
      case 'DID YOU KNOW':
        return { icon: Lightbulb, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' };
      case 'QUIZ':
        return { icon: HelpCircle, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
      default:
        return { icon: Info, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                onClick={() => navigate('/aisha-dashboard')}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
                alt="Ravan.ai Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1 flex items-center justify-end">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-700 font-medium">Aisha</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={2}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#9333ea"
          speed={1}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-purple-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-indigo-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Content Calendar Themes
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a day to generate themed content ideas for your weekly calendar
          </p>
          <p className="text-sm text-purple-600 mt-2 font-medium">
            ⏰ Idea generation may take up to 5 minutes - please be patient!
          </p>
        </div>

        {!selectedTheme ? (
          /* Weekly Calendar Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {themeDays.map((themeDay) => {
              const IconComponent = themeDay.icon;
              const isToday = themeDay.day === currentDay;
              return (
                <Card 
                  key={themeDay.day}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm min-h-[400px] ${
                    isToday 
                      ? 'bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 border-purple-300 shadow-xl ring-2 ring-purple-400/50' 
                      : 'bg-white/95 border-gray-200 hover:border-purple-300'
                  } rounded-2xl`}
                  onClick={() => {
                    console.log('📅 Day card clicked:', themeDay.day, themeDay.theme);
                    generateThemedIdeas(themeDay.theme, themeDay.day);
                  }}
                >
                  <CardHeader className="text-center pb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${themeDay.color} flex items-center justify-center mb-6 group-hover:animate-pulse shadow-lg`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{themeDay.day}</CardTitle>
                    <CardDescription className="text-center font-semibold text-gray-700 text-lg">
                      {themeDay.theme}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-base text-gray-600 text-center leading-relaxed mb-6 min-h-[6rem]">
                      {themeDay.description}
                    </p>
                    {(themeDay.day === 'Friday' || themeDay.day === 'Saturday') ? (
                      <div className="w-full">
                        <Button 
                          disabled
                          className="w-full py-3 px-6 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0 rounded-xl font-semibold text-base shadow-md cursor-not-allowed opacity-90"
                        >
                          <Lightbulb className="w-5 h-5 mr-2" />
                          Manual Research Required
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">This content requires manual research and curation</p>
                      </div>
                    ) : (
                      <Button 
                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔥 Generate Ideas button clicked for:', themeDay.day);
                          generateThemedIdeas(themeDay.theme, themeDay.day);
                        }}
                      >
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Generate Ideas
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Generated Ideas Display */
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {selectedTheme}
                </span>
              </h2>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    console.log('🔄 Regenerate button clicked');
                    const currentDay = themeDays.find(td => td.theme === selectedTheme)?.day || 'Monday';
                    generateThemedIdeas(selectedTheme, currentDay);
                  }}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Regenerate Ideas
                </Button>
                <Button
                  onClick={() => {
                    setSelectedTheme(null);
                    setIdeas([]);
                  }}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Back to Calendar
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Generating themed ideas...</p>
                <p className="text-sm text-purple-600 mt-2">This may take up to 5 minutes, please be patient!</p>
              </div>
            ) : ideas.length > 0 ? (
              <div className="space-y-10">
                {(() => {
                  const grouped = groupIdeasByType(ideas);
                  const isWednesdayNews = selectedTheme === 'Real Estate News';
                  
                  const typesToDisplay = isWednesdayNews 
                    ? Object.keys(grouped)
                    : (['INFORMATION', 'DID YOU KNOW', 'QUIZ'] as const).filter((t) => grouped[t] && grouped[t].length);
                  
                  return typesToDisplay.map((type) => {
                      const typeIdeas = grouped[type]!;
                      const config = getTypeConfig(type);
                      const TypeIcon = config.icon;
                      
                      return (
                        <div key={type} className="space-y-4">
                          {!isWednesdayNews && (
                            <div className={`flex items-center gap-3 p-4 ${config.bgColor} rounded-xl border ${config.borderColor}`}>
                              <TypeIcon className={`w-6 h-6 ${config.textColor}`} />
                              <h3 className={`text-xl font-bold ${config.textColor}`}>
                                {type}
                              </h3>
                              <Badge variant="secondary" className="ml-auto">
                                {typeIdeas.length} {typeIdeas.length === 1 ? 'Idea' : 'Ideas'}
                              </Badge>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {typeIdeas.map((idea) => (
                              <Card
                                key={idea.id}
                                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300"
                                onClick={() => setExpandedIdea(idea)}
                              >
                                <CardHeader>
                                  <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                                    {idea.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {idea.description}
                                  </p>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectIdea(idea);
                                    }}
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
                                  >
                                    Use This Idea
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No ideas generated yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Idea Details Dialog */}
      <Dialog open={!!expandedIdea} onOpenChange={() => setExpandedIdea(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">
              {expandedIdea?.title}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary:</h4>
                  <p className="text-gray-700">{expandedIdea?.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Detailed Content:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{expandedIdea?.detailedContent}</p>
                </div>
                {expandedIdea?.sourceUrl && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Source:</h4>
                    <a 
                      href={expandedIdea.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                    >
                      View Source <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
                <Button
                  onClick={() => {
                    if (expandedIdea) selectIdea(expandedIdea);
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
                >
                  Use This Idea
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AishaCalendarThemes;
