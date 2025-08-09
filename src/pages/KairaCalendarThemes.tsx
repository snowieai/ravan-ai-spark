import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  RefreshCw
} from 'lucide-react';
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
  videoStyle: string;
  duration: string;
  targetAudience: string;
}

const KairaCalendarThemes = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current day of the week
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  const themeDays: ThemeDay[] = [
    {
      day: 'Monday',
      theme: 'Major Real Estate Updates (Last Week)',
      description: 'Weekly real estate market updates and industry news',
      icon: Building,
      color: 'from-red-500 to-red-600'
    },
    {
      day: 'Tuesday', 
      theme: 'Top Selling Areas in Dubai',
      description: 'Highlight the most popular and trending areas',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      day: 'Wednesday',
      theme: 'Finance & Market News',
      description: 'Market analysis, financing options, and investment insights',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      day: 'Thursday',
      theme: 'Buyer Guide & FAQs',
      description: 'Educational content for potential buyers',
      icon: HelpCircle,
      color: 'from-purple-500 to-purple-600'
    },
    {
      day: 'Friday',
      theme: 'Global Market Comparison',
      description: 'Compare Dubai market with international markets',
      icon: Globe,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      day: 'Saturday',
      theme: 'Normal Day in a Real Estate Agent\'s Life',
      description: 'Behind-the-scenes look at agent life',
      icon: Coffee,
      color: 'from-orange-500 to-orange-600'
    },
    {
      day: 'Sunday',
      theme: 'A Sunday in a Real Estate Agent\'s Life',
      description: 'Weekend activities and lifestyle content',
      icon: Sun,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  // Send webhook notification and generate ideas
  const sendDayWebhook = async (day: string) => {
    console.log(`🚀 generateIdeasForDay called with: ${day}`);
    
    try {
      const webhookUrl = `https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c?day=${encodeURIComponent(day)}`;
      
      console.log(`📤 Sending GET request to: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log(`📨 Response status: ${response.status}`);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log(`✅ Webhook response:`, responseData);
        toast.success(`Ideas generated for ${day}!`);
        
        // Return the JSON array directly from webhook
        if (Array.isArray(responseData)) {
          return responseData.map((idea: any, index: number) => ({
            id: `webhook-${Date.now()}-${index}`,
            title: idea.title || `${day} Idea ${index + 1}`,
            description: idea.description || idea.content || String(idea),
            videoStyle: idea.style || 'Professional',
            duration: idea.duration || '60-90 seconds',
            targetAudience: idea.audience || 'Real Estate Professionals & Clients'
          }));
        } else {
          throw new Error('Webhook did not return an array');
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Webhook failed for ${day}:`, response.status, errorText);
        toast.error(`Failed to generate ideas for ${day}. Please try again.`);
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`🚨 Webhook error for ${day}:`, error);
      toast.error(`Failed to generate ideas. Please try again.`);
      throw error;
    }
  };


  const generateThemedIdeas = async (theme: string, day: string) => {
    console.log('🎯 generateThemedIdeas called!', { theme, day });
    
    setIsLoading(true);
    setSelectedTheme(theme);
    
    try {
      console.log('📞 About to call sendDayWebhook...');
      const webhookIdeas = await sendDayWebhook(day);
      console.log('✅ Webhook completed, ideas received:', webhookIdeas);
      
      if (webhookIdeas && webhookIdeas.length > 0) {
        setIdeas(webhookIdeas);
        toast.success(`Generated ${day} themed ideas successfully!`);
      } else {
        throw new Error('No ideas returned from webhook');
      }
    } catch (error) {
      console.error('❌ Error generating themed ideas:', error);
      toast.error(`Webhook failed: ${error.message}`);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseIdeas = (responseText: string, theme: string): GeneratedIdea[] => {
    try {
      const ideas = responseText.split('\n\n').filter(idea => idea.trim()).slice(0, 3);
      return ideas.map((idea, index) => ({
        id: `themed-${Date.now()}-${index}`,
        title: `${theme} - Idea ${index + 1}`,
        description: idea.trim(),
        videoStyle: 'Professional',
        duration: '60-90 seconds',
        targetAudience: 'Real Estate Professionals & Clients'
      }));
    } catch (error) {
      return generateFallbackIdeas(theme, 'Theme');
    }
  };

  const generateFallbackIdeas = (theme: string, day: string): GeneratedIdea[] => {
    const fallbackIdeas = [
      {
        id: `fallback-1-${Date.now()}`,
        title: `${theme} - Market Spotlight`,
        description: `Create engaging content showcasing ${theme.toLowerCase()} with professional insights and market data visualization.`,
        videoStyle: 'Professional',
        duration: '60-90 seconds',
        targetAudience: 'Real Estate Professionals & Clients'
      },
      {
        id: `fallback-2-${Date.now()}`,
        title: `${theme} - Expert Analysis`,
        description: `Develop expert commentary on ${theme.toLowerCase()} trends with actionable insights for viewers.`,
        videoStyle: 'Educational',
        duration: '90-120 seconds',
        targetAudience: 'Property Investors & Buyers'
      },
      {
        id: `fallback-3-${Date.now()}`,
        title: `${theme} - Quick Tips`,
        description: `Share quick, practical tips related to ${theme.toLowerCase()} in an easy-to-digest format.`,
        videoStyle: 'Informal',
        duration: '30-60 seconds',
        targetAudience: 'General Audience'
      }
    ];
    return fallbackIdeas;
  };

  const selectIdea = (idea: GeneratedIdea) => {
    localStorage.setItem('selectedIdea', JSON.stringify(idea));
    navigate('/kaira-script');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                onClick={() => navigate('/kaira-dashboard')}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
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
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-700 font-medium">Kaira</span>
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
          particleColor="#ff8c00"
          speed={1}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Content Calendar Themes
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a day to generate themed content ideas for your weekly calendar
          </p>
        </div>

        {!selectedTheme ? (
          /* Weekly Calendar Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {themeDays.map((themeDay) => {
              const IconComponent = themeDay.icon;
              const isToday = themeDay.day === currentDay;
              return (
                <Card 
                  key={themeDay.day}
                  className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm ${
                    isToday 
                      ? 'bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 border-orange-300 shadow-lg ring-2 ring-orange-400/50' 
                      : 'bg-white/90 border-orange-100'
                  }`}
                  onClick={() => {
                    console.log('📅 Day card clicked:', themeDay.day, themeDay.theme);
                    generateThemedIdeas(themeDay.theme, themeDay.day);
                  }}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${themeDay.color} flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{themeDay.day}</CardTitle>
                    <CardDescription className="text-center font-semibold text-gray-700">
                      {themeDay.theme}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                      {themeDay.description}
                    </p>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔥 Generate Ideas button clicked for:', themeDay.day);
                        generateThemedIdeas(themeDay.theme, themeDay.day);
                      }}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Generate Ideas
                    </Button>
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
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Back to Calendar
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Generating themed ideas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border-orange-100">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">{idea.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Style:</span>
                          <span className="text-orange-600">{idea.videoStyle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Duration:</span>
                          <span className="text-orange-600">{idea.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Audience:</span>
                          <span className="text-orange-600">{idea.targetAudience}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => selectIdea(idea)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500"
                      >
                        Select This Idea
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KairaCalendarThemes;