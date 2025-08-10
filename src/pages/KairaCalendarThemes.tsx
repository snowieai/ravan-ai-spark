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
  summary: string;
  detailedContent: string;
  videoStyle: string;
  duration: string;
  targetAudience: string;
}

const KairaCalendarThemes = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<GeneratedIdea | null>(null);
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

  // Fallback content for each day
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

  const retryWithBackoff = async function<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms for day: ${fn.name}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  const validateDayParameter = (day: string): boolean => {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return validDays.includes(day.toLowerCase());
  };

  // Send webhook notification and generate ideas with robust error handling
  const sendDayWebhook = async (day: string) => {
    // Validate day parameter
    if (!validateDayParameter(day)) {
      console.error(`❌ Invalid day parameter: ${day}`);
      throw new Error(`Invalid day: ${day}`);
    }

    const normalizedDay = day.toLowerCase();
    console.log(`🚀 Sending webhook for day: ${normalizedDay}`);
    
    return retryWithBackoff(async () => {
      const webhookUrl = `https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c?day=${encodeURIComponent(normalizedDay)}`;
      console.log(`📤 Calling webhook: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(300000) // 5 minute timeout
      });

      console.log(`📨 Response status for ${normalizedDay}: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Webhook failed for ${normalizedDay}:`, response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.text();
      console.log(`📥 Raw webhook response for ${normalizedDay}:`, responseData.substring(0, 200) + '...');
      
      // Validate response
      if (!responseData || responseData.trim().length === 0) {
        throw new Error('Empty response from webhook');
      }
      
      // First try to parse as JSON to extract the output field
      let contentToParse = responseData;
      try {
        const jsonResponse = JSON.parse(responseData);
        if (jsonResponse.output) {
          contentToParse = jsonResponse.output;
          console.log(`📊 Extracted output field from JSON response for ${normalizedDay}`);
        }
      } catch (jsonError) {
        console.log(`📝 Response is not JSON for ${normalizedDay}, parsing as text directly`);
      }
      
      // Parse ideas separated by ### followed by numbers
      // Skip the first element which is usually just the header before first ###
      const allBlocks = contentToParse.split(/### \d+\./);
      const ideaBlocks = allBlocks.slice(1).filter(block => block.trim()); // Skip header, keep only actual ideas
      console.log(`📊 Found ${ideaBlocks.length} idea blocks for ${normalizedDay} (after skipping header)`);
      
      // Validate we have content blocks
      if (ideaBlocks.length === 0) {
        throw new Error('No valid idea blocks found in response');
      }
      
      const ideas: GeneratedIdea[] = ideaBlocks.map((block, index) => {
        const trimmedBlock = block.trim();
        
        // Extract title (first line before 📄 or first non-empty line)
        const lines = trimmedBlock.split('\n').filter(line => line.trim());
        const title = lines[0]?.trim() || `${normalizedDay} Idea ${index + 1}`;
        
        // Extract summary (after 📄 Summary: and before 🔍)
        const summaryMatch = trimmedBlock.match(/📄 Summary:\s*([^🔍]+)/);
        const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';
        
        // Extract detailed content (after 🔍 Detailed Explanation:) and format it
        const detailedMatch = trimmedBlock.match(/🔍 Detailed Explanation:\s*(.+)/s);
        let detailedContent = detailedMatch ? detailedMatch[1].trim() : 'No detailed content available';
        
        // Parse JSON and format as clean paragraphs
        try {
          const jsonMatch = detailedContent.match(/\{.+\}/s);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            let formattedContent = '';
            
            Object.entries(jsonData).forEach(([section, content]) => {
              if (Array.isArray(content)) {
                formattedContent += `${section}: `;
                formattedContent += content.map(item => item.replace(/^\-\s*/, '')).join('. ') + '. ';
                formattedContent += '\n\n';
              }
            });
            
            detailedContent = formattedContent.trim();
          }
        } catch (e) {
          // Keep original content if JSON parsing fails
        }
        
        return {
          id: `webhook-${Date.now()}-${index}`,
          title: title,
          description: summary,
          summary: summary,
          detailedContent: detailedContent,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas for ${normalizedDay}`);
      
      // Ensure we have at least some ideas
      if (ideas.length === 0) {
        throw new Error('No ideas could be parsed from response');
      }
      
      return ideas;
    }, 2, 2000); // 2 retries with exponential backoff starting at 2 seconds
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
      console.log('🔄 Using fallback ideas due to webhook failure');
      
      // Use fallback ideas instead of showing empty state
      const fallbackIdeas = getFallbackIdeas(day, theme);
      setIdeas(fallbackIdeas);
      
      toast.error(`Webhook failed, showing fallback ideas: ${error.message}`);
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
        summary: idea.trim(),
        detailedContent: idea.trim(),
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
        summary: `Create engaging content showcasing ${theme.toLowerCase()} with professional insights and market data visualization.`,
        detailedContent: `Create engaging content showcasing ${theme.toLowerCase()} with professional insights and market data visualization.`,
        videoStyle: 'Professional',
        duration: '60-90 seconds',
        targetAudience: 'Real Estate Professionals & Clients'
      },
      {
        id: `fallback-2-${Date.now()}`,
        title: `${theme} - Expert Analysis`,
        description: `Develop expert commentary on ${theme.toLowerCase()} trends with actionable insights for viewers.`,
        summary: `Develop expert commentary on ${theme.toLowerCase()} trends with actionable insights for viewers.`,
        detailedContent: `Develop expert commentary on ${theme.toLowerCase()} trends with actionable insights for viewers.`,
        videoStyle: 'Educational',
        duration: '90-120 seconds',
        targetAudience: 'Property Investors & Buyers'
      },
      {
        id: `fallback-3-${Date.now()}`,
        title: `${theme} - Quick Tips`,
        description: `Share quick, practical tips related to ${theme.toLowerCase()} in an easy-to-digest format.`,
        summary: `Share quick, practical tips related to ${theme.toLowerCase()} in an easy-to-digest format.`,
        detailedContent: `Share quick, practical tips related to ${theme.toLowerCase()} in an easy-to-digest format.`,
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
          <p className="text-sm text-orange-600 mt-2 font-medium">
            ⏰ Idea generation may take up to 5 minutes - please be patient!
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
                <p className="text-sm text-orange-600 mt-2">This may take up to 5 minutes, please be patient!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, index) => (
                  <Card key={idea.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-gray-800 font-medium text-lg leading-relaxed">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <Button
                          onClick={() => setExpandedIdea(idea)}
                          variant="outline"
                          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          View detailed explanation
                        </Button>
                        
                        <Button 
                          onClick={() => selectIdea(idea)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium py-3"
                        >
                          Select This Idea
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Idea Dialog */}
      <Dialog open={!!expandedIdea} onOpenChange={() => setExpandedIdea(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {expandedIdea?.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600">
              Detailed content breakdown and insights
            </DialogDescription>
          </DialogHeader>
          
          {expandedIdea && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{expandedIdea.summary}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-2">Detailed Content</h3>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {expandedIdea.detailedContent.split('\n\n').map((paragraph, index) => {
                    const trimmedParagraph = paragraph.trim();
                    if (!trimmedParagraph) return null;
                    
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {trimmedParagraph}
                      </p>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">Video Style</h4>
                  <p className="text-orange-600">{expandedIdea.videoStyle}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Duration</h4>
                  <p className="text-orange-600">{expandedIdea.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Target Audience</h4>
                  <p className="text-orange-600">{expandedIdea.targetAudience}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  onClick={() => setExpandedIdea(null)}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    selectIdea(expandedIdea);
                    setExpandedIdea(null);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Select This Idea
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KairaCalendarThemes;