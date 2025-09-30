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
  Info
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
}

const KairaCalendarThemes = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<GeneratedIdea | null>(null);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging for state changes
  console.log('🎯 KairaCalendarThemes render state:', { 
    selectedTheme, 
    isLoading, 
    ideasLength: ideas.length,
    ideas: ideas.map(idea => ({ id: idea.id, title: idea.title }))
  });

  // Get current day of the week
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
      color: 'from-orange-500 to-orange-600'
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

  // No retry logic - make single direct request

  const validateDayParameter = (day: string): boolean => {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return validDays.includes(day.toLowerCase());
  };

  // Send webhook notification and generate ideas - SINGLE REQUEST ONLY
  const sendDayWebhook = async (day: string) => {
    // Validate day parameter
    if (!validateDayParameter(day)) {
      console.error(`❌ Invalid day parameter: ${day}`);
      throw new Error(`Invalid day: ${day}`);
    }

    const normalizedDay = day.toLowerCase();
    console.log(`🚀 Making SINGLE webhook request for day: ${normalizedDay}`);
    console.log(`🎯 REQUESTED DAY: "${normalizedDay}" (length: ${normalizedDay.length})`);
    
    const webhookUrl = `https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c?day=${encodeURIComponent(normalizedDay)}`;
    console.log(`📤 FULL URL BEING CALLED: ${webhookUrl}`);
    console.log(`🔍 URL BREAKDOWN:`)
    console.log(`   Base: https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c`);
    console.log(`   Query: ?day=${encodeURIComponent(normalizedDay)}`);
    console.log(`   Encoded day: ${encodeURIComponent(normalizedDay)}`);
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(300000) // 5 minute timeout - WAIT THE FULL TIME
    });

    console.log(`📨 Response status for ${normalizedDay}: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Webhook HTTP error for ${normalizedDay}:`, response.status, errorText);
      throw new Error(`Webhook HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.text();
    console.log(`📥 FULL webhook response for ${normalizedDay}:`, responseData);
    
    // 🚨 CRITICAL DEBUG: Check if response content mentions wrong day
    const contentLower = responseData.toLowerCase();
    console.log(`🔍 CONTENT VALIDATION for ${normalizedDay}:`);
    console.log(`   Response contains "${normalizedDay}": ${contentLower.includes(normalizedDay)}`);
    console.log(`   Response contains "tuesday": ${contentLower.includes('tuesday')}`);
    console.log(`   Response contains "monday": ${contentLower.includes('monday')}`);
    console.log(`   Response contains "wednesday": ${contentLower.includes('wednesday')}`);
    console.log(`   Response contains "thursday": ${contentLower.includes('thursday')}`);
    console.log(`   Response contains "friday": ${contentLower.includes('friday')}`);
    console.log(`   Response contains "saturday": ${contentLower.includes('saturday')}`);
    console.log(`   Response contains "sunday": ${contentLower.includes('sunday')}`);
    
    // 🚨 WARNING: Check if wrong day content returned
    const wrongDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      .filter(day => day !== normalizedDay && contentLower.includes(day + ' themed') || contentLower.includes(day + ' content'));
    
    if (wrongDays.length > 0) {
      console.warn(`⚠️ BACKEND ISSUE DETECTED: Requested "${normalizedDay}" but response contains content for: ${wrongDays.join(', ')}`);
      toast.error(`Backend returned wrong day content: Expected ${normalizedDay}, got ${wrongDays.join(', ')}`);
    }
    
    // Validate we got actual response content
    if (!responseData || responseData.trim().length === 0) {
      console.error(`❌ Empty response from webhook for ${normalizedDay}`);
      throw new Error('Empty response from webhook');
    }
    
    // Enhanced JSON parsing with detailed logging
    let contentToParse = responseData;
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(`📊 Parsed JSON structure for ${normalizedDay}:`, Array.isArray(jsonResponse) ? 'array' : typeof jsonResponse, Array.isArray(jsonResponse) ? `length=${jsonResponse.length}` : Object.keys(jsonResponse));
      
      // If webhook already returns a JSON array -> map directly and return
      if (Array.isArray(jsonResponse)) {
        const directIdeas = jsonResponse.map((item: any, index: number) => ({
          id: item.id || `idea-${index}`,
          title: item.title || `Idea ${index + 1}`,
          description: item.summary || item.description || 'No description available',
          summary: item.summary || item.description || 'No summary available',
          detailedContent: item.summary || item.description || 'No detailed content available',
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients',
          type: item.type || 'INFORMATION',
        }));
        console.log(`✅ Direct array from webhook for ${normalizedDay}: ${directIdeas.length} ideas`);
        return directIdeas;
      }
      
      if (jsonResponse.output) {
        const out = jsonResponse.output;
        if (Array.isArray(out)) {
          const outputIdeas = out.map((item: any, index: number) => ({
            id: item.id || `idea-${index}`,
            title: item.title || `Idea ${index + 1}`,
            description: item.summary || item.description || 'No description available',
            summary: item.summary || item.description || 'No summary available',
            detailedContent: item.summary || item.description || 'No detailed content available',
            videoStyle: 'Professional',
            duration: '60-90 seconds',
            targetAudience: 'Real Estate Professionals & Clients',
            type: item.type || 'INFORMATION',
          }));
          console.log(`✅ Direct array in 'output' for ${normalizedDay}: ${outputIdeas.length} ideas`);
          return outputIdeas;
        }
        contentToParse = typeof out === 'string' ? out : JSON.stringify(out);
        const preview = typeof out === 'string' ? out.substring(0, 300) : JSON.stringify(out).substring(0, 300);
        console.log(`📊 Extracted output field for ${normalizedDay}:`, preview + '...');
      } else {
        // IMPORTANT: If no 'output' field, use the parsed JSON directly (as string)
        contentToParse = JSON.stringify(jsonResponse);
        console.log(`📝 No 'output' field found, using full JSON response for ${normalizedDay} (as string)`);
      }
    } catch (jsonError) {
      console.log(`📝 Response is not JSON for ${normalizedDay}, using as plain text`);
    }
    
    // Use robust parser that handles JSON arrays and text
    console.log(`🔄 Parsing response content with parseIdeas for ${normalizedDay}`);
    const ideas = parseIdeas(contentToParse, normalizedDay);
    
    if (ideas.length === 0) {
      console.log(`⚠️ Parser returned no ideas for ${normalizedDay}, using fallback`);
      const themeData = themeDays.find(td => td.day.toLowerCase() === normalizedDay);
      return generateFallbackIdeas(normalizedDay, themeData?.theme || normalizedDay);
    }
    
    console.log(`✅ Successfully parsed ${ideas.length} structured ideas for ${normalizedDay}`);
    return ideas;
  };


  const generateThemedIdeas = async (theme: string, day: string) => {
    console.log('🎯 generateThemedIdeas called - SINGLE REQUEST ONLY!', { theme, day });
    
    setIsLoading(true);
    setSelectedTheme(theme);
    
    try {
      console.log('📞 Making single webhook call for:', day);
      const webhookIdeas = await sendDayWebhook(day);
      console.log('✅ Webhook response received:', webhookIdeas.length, 'ideas');
      console.log('🔄 About to set ideas in state:', webhookIdeas.map(idea => ({ id: idea.id, title: idea.title })));
      
      // Display webhook content immediately - no conditions that cause fallbacks
      setIdeas(webhookIdeas);
      console.log('🎯 setIdeas called with length:', webhookIdeas.length);
      
      toast.success(`Generated ${webhookIdeas.length} ${day} themed ideas successfully!`);
      
    } catch (error) {
      console.error('❌ Webhook request completely failed:', error);
      console.log('🔄 Network/timeout error - using fallback ideas');
      
      // Only use fallbacks if webhook request completely failed (network/timeout errors)
      const fallbackIdeas = getFallbackIdeas(day, theme);
      setIdeas(fallbackIdeas);
      
      toast.error(`Webhook request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🎯 setIsLoading(false) called');
    }
  };

  const parseIdeas = (responseText: string, requestedDay: string): GeneratedIdea[] => {
    console.log(`🔍 Parsing response for "${requestedDay}" - text length: ${responseText.length}`);

    const responseFormat = detectResponseFormat(responseText);
    console.log(`📊 Detected response format: ${responseFormat}`);

    // Helpers
    const safeParse = (txt: string) => {
      try { return JSON.parse(txt); } catch { return null; }
    };

    // Extract a balanced JSON segment starting at startIndex
    const extractBalanced = (text: string, open: string, close: string, startIndex: number): string | null => {
      let depth = 0;
      let inString = false;
      let prev = '';
      for (let i = startIndex; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"' && prev !== '\\') inString = !inString;
        if (!inString) {
          if (ch === open) depth++;
          if (ch === close) {
            depth--;
            if (depth === 0) return text.slice(startIndex, i + 1);
          }
        }
        prev = ch;
      }
      return null;
    };

    const extractJsonArrayFromText = (text: string): any[] | null => {
      const start = text.indexOf('[');
      if (start === -1) return null;
      const slice = extractBalanced(text, '[', ']', start);
      if (!slice) return null;
      const arr = safeParse(slice);
      return Array.isArray(arr) ? arr : null;
    };

    const extractJsonObjectsFromText = (text: string): any[] => {
      const results: any[] = [];
      let i = 0;
      while (i < text.length) {
        const start = text.indexOf('{', i);
        if (start === -1) break;
        const slice = extractBalanced(text, '{', '}', start);
        if (!slice) break;
        const obj = safeParse(slice);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          results.push(obj);
        }
        i = start + slice.length;
      }
      return results;
    };

    try {
      // First attempt to parse as JSON or double-encoded JSON
      let parsed: any = safeParse(responseText);
      console.log('🧪 First JSON.parse result type:', typeof parsed, Array.isArray(parsed) ? 'array' : '');

      if (typeof parsed === 'string') {
        const second = safeParse(parsed);
        if (second) {
          parsed = second;
          console.log('🧪 Unwrapped double-encoded JSON successfully');
        }
      }

      // Unwrap common { output: ... } shape
      if (parsed && typeof parsed === 'object' && 'output' in parsed) {
        const out: any = (parsed as any).output;
        if (Array.isArray(out)) parsed = out;
        else if (typeof out === 'string') {
          const inner = safeParse(out);
          if (inner) parsed = inner;
        }
      }

      const toGenerated = (list: any[]): GeneratedIdea[] => {
        return list.map((raw: any, index: number) => {
          let idea: any = raw;
          if (typeof raw === 'string') {
            let s = raw.trim();
            if (s.endsWith(',')) s = s.slice(0, -1);
            let parsedItem: any = safeParse(s);
            if (!parsedItem && s.includes('{') && s.includes('}')) {
              const start = s.indexOf('{');
              const end = s.lastIndexOf('}');
              if (start !== -1 && end !== -1 && end > start) {
                parsedItem = safeParse(s.slice(start, end + 1));
              }
            }
            idea = parsedItem || { title: s, summary: s };
          }
          return {
            id: idea.id || `idea-${index}`,
            title: idea.title || `Idea ${index + 1}`,
            description: idea.summary || idea.description || 'No description available',
            summary: idea.summary || idea.description || 'No summary available',
            detailedContent: idea.summary || idea.detailedContent || idea.detailed_content || idea.content || 'No detailed content available',
            videoStyle: idea.videoStyle || idea.video_style || 'Professional',
            duration: idea.duration || '60 seconds',
            targetAudience: idea.targetAudience || idea.target_audience || 'Real estate professionals',
            type: idea.type || 'INFORMATION',
          };
        });
      };

      if (Array.isArray(parsed)) {
        const ideas = toGenerated(parsed);
        console.log(`📋 Parsed ${ideas.length} structured ideas from array`);
        return ideas;
      } else if (parsed && parsed.ideas && Array.isArray(parsed.ideas)) {
        const ideas = toGenerated(parsed.ideas);
        console.log(`📋 Parsed ${ideas.length} structured ideas from nested object`);
        return ideas;
      }

      // Try to slice array from raw text
      const arr = extractJsonArrayFromText(responseText);
      if (arr && arr.length) {
        const ideas = toGenerated(arr);
        console.log(`📦 Extracted JSON array from text with ${ideas.length} items`);
        return ideas;
      }

      // Try scanning for multiple objects
      const objects = extractJsonObjectsFromText(responseText);
      if (objects.length > 1) {
        const ideas = toGenerated(objects);
        console.log(`📦 Extracted ${ideas.length} JSON objects from text`);
        return ideas;
      }
    } catch (parseError) {
      console.warn(`⚠️ JSON parse failed:`, parseError);
    }

    console.log(`📝 Attempting advanced text parsing for unstructured content...`);
    const textParsedIdeas = parseUnstructuredText(responseText, requestedDay);

    // Defensive re-check: if only one and it looks like JSON, try object scan as a last attempt
    if (textParsedIdeas.length === 1 && /^{|\[/.test(textParsedIdeas[0].title || '') ) {
      const objects = extractJsonObjectsFromText(responseText);
      if (objects.length > 1) {
        const ideas = objects.map((obj, idx) => ({
          id: obj.id || `idea-${idx}`,
          title: obj.title || `Idea ${idx + 1}`,
          description: obj.summary || obj.description || 'No description available',
          summary: obj.summary || obj.description || 'No summary available',
          detailedContent: obj.summary || obj.detailedContent || obj.content || 'No detailed content available',
          videoStyle: obj.videoStyle || 'Professional',
          duration: obj.duration || '60 seconds',
          targetAudience: obj.targetAudience || 'Real estate professionals',
          type: obj.type || 'INFORMATION',
        }));
        console.log(`✅ Rescued ${ideas.length} ideas via object scan`);
        return ideas;
      }
    }

    if (textParsedIdeas.length > 0) {
      console.log(`📝 Successfully parsed ${textParsedIdeas.length} ideas from unstructured text`);
      return textParsedIdeas;
    }

    console.warn(`🚨 All parsing attempts failed, using fallback ideas`);
    return generateFallbackIdeas(requestedDay, requestedDay);
  };
  const detectResponseFormat = (responseText: string): string => {
    const text = responseText.trim();
    
    if (text.startsWith('{') || text.startsWith('[')) {
      return 'JSON';
    } else if (text.includes('**') || text.includes('##') || text.includes('1.') || text.includes('- ')) {
      return 'MARKDOWN/STRUCTURED_TEXT';
    } else if (text.includes('\n\n') || text.includes('Idea:') || text.includes('Title:')) {
      return 'UNSTRUCTURED_TEXT';
    } else {
      return 'UNKNOWN';
    }
  };

  const parseUnstructuredText = (responseText: string, requestedDay: string): GeneratedIdea[] => {
    console.log(`🔍 Enhanced universal parsing for "${requestedDay}"`);
    console.log(`📝 Raw response preview:`, responseText.substring(0, 500));
    
    let ideas: GeneratedIdea[] = [];
    
    // Pattern 1: Saturday format (*1. 9. **TITLE*** ... 📄 Summary: ... 🔍 Detailed Explanation:)
    const saturdayPattern = /\*(\d+)\.\s*(\d+)\.\s*\*\*([^*]+)\*\*\*[\s\S]*?📄\s*Summary:\s*([\s\S]*?)🔍\s*Detailed[^:]*:\s*([\s\S]*?)(?=\*\d+\.|$)/g;
    const saturdayMatches = [...responseText.matchAll(saturdayPattern)];
    console.log(`🔍 Saturday pattern: Found ${saturdayMatches.length} matches`);
    
    if (saturdayMatches.length > 0) {
      ideas = saturdayMatches.map((match, index) => {
        const title = match[3]?.trim() || `Idea ${index + 1}`;
        const summary = match[4]?.trim() || 'No summary available';
        let detailedContent = match[5]?.trim() || 'No detailed content available';
        
        // Clean up detailed content from complex markdown and preserve bullet points
        detailedContent = detailedContent
          .replace(/## Detailed Explanation/g, '')
          .replace(/### Key Insights/g, '**Key Insights:**')
          .replace(/### Investment Opportunities/g, '**Investment Opportunities:**')
          .replace(/### Reasons for Popularity/g, '**Reasons for Popularity:**')
          .replace(/### Market Trends/g, '**Market Trends:**')
          .replace(/### Visual Suggestions/g, '**Visual Suggestions:**')
          .replace(/•/g, '•') // Preserve bullet points
          .trim();
        
        return {
          id: `saturday-${Date.now()}-${index}`,
          title: title,
          description: summary.substring(0, 150) + (summary.length > 150 ? '...' : ''),
          summary: summary,
          detailedContent: detailedContent,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas using Saturday format`);
      return ideas;
    }
    
    // Pattern 2: Friday format (*1. **TITLE*** ... 📄 Summary: ... 🔍 Detailed Explanation:)
    const fridayPattern = /\*(\d+)\.\s*\*\*([^*]+)\*\*\*[\s\S]*?📄\s*Summary:\s*([\s\S]*?)🔍\s*Detailed[^:]*:\s*([\s\S]*?)(?=\*\d+\.|$)/g;
    const fridayMatches = [...responseText.matchAll(fridayPattern)];
    console.log(`🔍 Friday pattern: Found ${fridayMatches.length} matches`);
    
    if (fridayMatches.length > 0) {
      ideas = fridayMatches.map((match, index) => {
        const title = match[2]?.trim() || `Idea ${index + 1}`;
        const summary = match[3]?.trim() || 'No summary available';
        let detailedContent = match[4]?.trim() || 'No detailed content available';
        
        // Clean up detailed content from complex markdown
        detailedContent = detailedContent
          .replace(/## Detailed Explanation/g, '')
          .replace(/### Key Insights/g, '**Key Insights:**')
          .replace(/### Investment Opportunities/g, '**Investment Opportunities:**')
          .replace(/### Reasons for Popularity/g, '**Reasons for Popularity:**')
          .replace(/### Market Trends/g, '**Market Trends:**')
          .replace(/### Visual Suggestions/g, '**Visual Suggestions:**')
          .trim();
        
        return {
          id: `friday-${Date.now()}-${index}`,
          title: title,
          description: summary.substring(0, 150) + (summary.length > 150 ? '...' : ''),
          summary: summary,
          detailedContent: detailedContent,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas using Friday format`);
      return ideas;
    }
    
    // Pattern 2: Wednesday format (*1. TITLE ... 📄 Summary: ... 🔍 Detailed:)
    const wednesdayPattern = /\*(\d+)\.\s*([^*\n]+)\*[\s\S]*?📄 Summary:\s*([\s\S]*?)🔍 Detailed Explanation:\s*([\s\S]*?)(?=\*\d+\.|$)/g;
    const wednesdayMatches = [...responseText.matchAll(wednesdayPattern)];
    console.log(`🔍 Wednesday pattern: Found ${wednesdayMatches.length} matches`);
    
    if (wednesdayMatches.length > 0) {
      ideas = wednesdayMatches.map((match, index) => {
        const title = match[2]?.trim() || `Idea ${index + 1}`;
        const summary = match[3]?.trim() || 'No summary available';
        let detailedContent = match[4]?.trim() || 'No detailed content available';
        
        // Parse JSON content if present
        try {
          const jsonMatch = detailedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            let formatted = '';
            
            Object.entries(jsonData).forEach(([section, content]) => {
              formatted += `**${section}:**\n`;
              if (Array.isArray(content)) {
                content.forEach(item => {
                  formatted += `• ${typeof item === 'string' ? item.replace(/^\-\s*/, '') : item}\n`;
                });
              } else {
                formatted += `• ${content}\n`;
              }
              formatted += '\n';
            });
            
            detailedContent = formatted.trim();
          }
        } catch (e) {
          console.log(`📝 Keeping original detailed content for idea ${index + 1}`);
        }
        
        return {
          id: `universal-${Date.now()}-${index}`,
          title: title,
          description: summary.substring(0, 150) + (summary.length > 150 ? '...' : ''),
          summary: summary,
          detailedContent: detailedContent,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas using Wednesday format`);
      return ideas;
    }
    
    // Pattern 2: Try Thursday format (### 1. TITLE ...)
    const thursdayPattern = /###\s*(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=###\s*\d+\.|$)/g;
    const thursdayMatches = [...responseText.matchAll(thursdayPattern)];
    console.log(`🔍 Thursday pattern: Found ${thursdayMatches.length} matches`);
    
    if (thursdayMatches.length > 0) {
      ideas = thursdayMatches.map((match, index) => {
        const title = match[2]?.trim() || `Idea ${index + 1}`;
        const content = match[3]?.trim() || 'No content available';
        
        return {
          id: `universal-${Date.now()}-${index}`,
          title: title,
          description: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
          summary: content.substring(0, 200),
          detailedContent: content,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas using Thursday format`);
      return ideas;
    }
    
    // Pattern 4: Enhanced Saturday patterns (multiple bullet/numbering styles)
    const saturdayPatterns = [
      // Various bullet styles
      /(?:•|\*|\►|\▸|\→)\s*(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=(?:•|\*|\►|\▸|\→)\s*\d+\.|$)/g,
      // Parentheses numbering
      /\((\d+)\)\s*([^\n]+)\n([\s\S]*?)(?=\(\d+\)|$)/g,
      // Number with closing parenthesis
      /(\d+)\)\s*([^\n]+)\n([\s\S]*?)(?=\d+\)|$)/g,
      // Bold numbered format
      /\*\*(\d+)\.\*\*\s*([^\n]+)\n([\s\S]*?)(?=\*\*\d+\.|$)/g,
      // Emoji-based numbering (common in Saturday content)
      /(?:🏠|🏢|📈|💼|🌟|⭐|🔥|💡|📊|🎯)\s*(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=(?:🏠|🏢|📈|💼|🌟|⭐|🔥|💡|📊|🎯)\s*\d+\.|$)/g
    ];

    for (const [patternIndex, pattern] of saturdayPatterns.entries()) {
      pattern.lastIndex = 0; // Reset regex
      const matches = [...responseText.matchAll(pattern)];
      console.log(`🔍 Saturday pattern ${patternIndex + 1}: Found ${matches.length} matches`);
      
      if (matches.length > 0) {
        ideas = matches.map((match, index) => {
          const title = match[2]?.trim() || `Idea ${index + 1}`;
          const content = match[3]?.trim() || 'No content available';
          
          return {
            id: `saturday-${Date.now()}-${index}`,
            title: title,
            description: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
            summary: content.substring(0, 200),
            detailedContent: content,
            videoStyle: 'Professional',
            duration: '60-90 seconds',
            targetAudience: 'Real Estate Professionals & Clients'
          };
        });
        
        console.log(`✅ Successfully parsed ${ideas.length} ideas using Saturday pattern ${patternIndex + 1}`);
        return ideas;
      }
    }

    // Pattern 5: Simple numbered list (1. TITLE ...)
    const numberedPattern = /(\d+)\.\s*([^\n]+)(?:\n([\s\S]*?))?(?=\d+\.|$)/g;
    const numberedMatches = [...responseText.matchAll(numberedPattern)];
    console.log(`🔍 Simple numbered pattern: Found ${numberedMatches.length} matches`);
    
    if (numberedMatches.length > 1) {
      ideas = numberedMatches.map((match, index) => {
        const title = match[2]?.trim() || `Idea ${index + 1}`;
        const content = match[3]?.trim() || match[2]?.trim() || 'No content available';
        
        return {
          id: `universal-${Date.now()}-${index}`,
          title: title,
          description: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
          summary: content.substring(0, 200),
          detailedContent: content,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
      
      console.log(`✅ Successfully parsed ${ideas.length} ideas using simple numbered format`);
      return ideas;
    }
    
    // Fallback: Split by content sections if no patterns match
    if (ideas.length === 0) {
      console.log(`🔄 No patterns matched, using intelligent content chunking`);
      
      // Split by multiple separators
      const sections = responseText
        .split(/\n\s*\n|\*{2,}|#{2,}|={3,}|-{3,}/)
        .filter(section => section.trim().length > 30)
        .slice(0, 8);
      
      ideas = sections.map((section, index) => {
        const lines = section.trim().split('\n').filter(line => line.trim());
        const title = extractTitle(lines[0]) || `${requestedDay} Idea ${index + 1}`;
        const content = lines.slice(1).join(' ').trim() || lines[0] || 'No content available';
        
        return {
          id: `fallback-${Date.now()}-${index}`,
          title: title,
          description: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
          summary: content.substring(0, 200),
          detailedContent: content,
          videoStyle: 'Professional',
          duration: '60-90 seconds',
          targetAudience: 'Real Estate Professionals & Clients'
        };
      });
    }
    
    console.log(`📊 Universal parser final result: ${ideas.length} ideas generated`);
    return ideas;
  };

  const extractTitle = (line: string): string => {
    if (!line) return '';
    
    // Remove common prefixes and clean up
    const cleaned = line
      .replace(/^(?:\d+\.|[-*])\s*/, '') // Remove numbering/bullets
      .replace(/^(?:Title:|Idea:|Content:)\s*/i, '') // Remove common prefixes
      .replace(/^\*\*(.+?)\*\*/, '$1') // Remove markdown bold
      .replace(/^##?\s*/, '') // Remove markdown headers
      .trim();
    
    // Take first sentence or up to 80 characters
    const firstSentence = cleaned.split(/[.!?]/)[0];
    return firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence;
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

  // Group ideas by type
  const groupIdeasByType = (ideas: GeneratedIdea[]) => {
    const grouped: { [key: string]: GeneratedIdea[] } = {};
    ideas.forEach(idea => {
      const type = idea.type || 'INFORMATION';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(idea);
    });
    return grouped;
  };

  // Get icon and color for type
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {themeDays.map((themeDay) => {
              const IconComponent = themeDay.icon;
              const isToday = themeDay.day === currentDay;
              return (
                <Card 
                  key={themeDay.day}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm min-h-[400px] ${
                    isToday 
                      ? 'bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 border-orange-300 shadow-xl ring-2 ring-orange-400/50' 
                      : 'bg-white/95 border-gray-200 hover:border-orange-300'
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
                        className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
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
            ) : ideas.length > 0 ? (
              <div className="space-y-10">
                {Object.entries(groupIdeasByType(ideas)).map(([type, typeIdeas]) => {
                  const config = getTypeConfig(type);
                  const TypeIcon = config.icon;
                  
                  return (
                    <div key={type} className="space-y-4">
                      {/* Category Header */}
                      <div className={`flex items-center gap-3 p-4 ${config.bgColor} rounded-xl border ${config.borderColor}`}>
                        <TypeIcon className={`w-6 h-6 ${config.textColor}`} />
                        <h3 className={`text-xl font-bold ${config.textColor}`}>
                          {type}
                        </h3>
                        <Badge variant="secondary" className="ml-auto">
                          {typeIdeas.length} {typeIdeas.length === 1 ? 'Idea' : 'Ideas'}
                        </Badge>
                      </div>

                      {/* Ideas Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {typeIdeas.map((idea) => (
                          <Card key={idea.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge variant="outline" className={`${config.textColor} ${config.borderColor}`}>
                                  {type}
                                </Badge>
                              </div>
                              <CardTitle className="text-gray-800 font-semibold text-lg leading-tight">
                                {idea.title}
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                  {idea.summary}
                                </p>
                                
                                <div className="space-y-2 pt-2">
                                  <Button
                                    onClick={() => setExpandedIdea(idea)}
                                    variant="outline"
                                    size="sm"
                                    className={`w-full ${config.textColor} ${config.borderColor} hover:${config.bgColor}`}
                                  >
                                    View Details
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => selectIdea(idea)}
                                    size="sm"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium"
                                  >
                                    Select This Idea
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No ideas available to display</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Idea Dialog */}
      <Dialog open={!!expandedIdea} onOpenChange={() => setExpandedIdea(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {expandedIdea?.title}
                </DialogTitle>
                {expandedIdea?.type && (
                  <Badge variant="outline" className={getTypeConfig(expandedIdea.type).textColor + ' ' + getTypeConfig(expandedIdea.type).borderColor}>
                    {expandedIdea.type}
                  </Badge>
                )}
              </div>
            </div>
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