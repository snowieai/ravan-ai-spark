import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SparklesCore } from '@/components/ui/sparkles';
import ConnectionStatus from '@/components/ConnectionStatus';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { safeSupabaseQuery } from '@/lib/supabase-utils';

interface ContentItem {
  id: string;
  topic: string;
  scheduled_date: string;
  status: 'planned' | 'approved' | 'script_ready' | 'in_production' | 'published' | 'cancelled';
  priority: 1 | 2 | 3;
  notes?: string;
  script_content?: string;
  category?: string;
  content_type: 'reel' | 'story' | 'carousel';
  inspiration_links?: string;
}

const statusColors = {
  planned: "bg-slate-100 text-slate-800",
  approved: "bg-blue-100 text-blue-800",
  script_ready: "bg-yellow-100 text-yellow-800",
  in_production: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const priorityColors = {
  1: "border-l-green-500",
  2: "border-l-yellow-500", 
  3: "border-l-red-500"
};

const contentTypeColors = {
  "reel": "bg-red-100 text-red-800 border-red-200",
  "story": "bg-blue-100 text-blue-800 border-blue-200",
  "carousel": "bg-purple-100 text-purple-800 border-purple-200"
};

const contentTypeIcons = {
  "reel": "🎬",
  "story": "📸", 
  "carousel": "🖼️"
};

const KairaCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState<string | null>(null);
  
  const [newContent, setNewContent] = useState({
    topic: '',
    scheduled_date: '',
    status: 'planned' as ContentItem['status'],
    priority: 1 as ContentItem['priority'],
    notes: '',
    script_content: '',
    content_type: 'reel' as ContentItem['content_type'],
    inspiration_links: ''
  });

  useEffect(() => {
    fetchContentItems();
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchContentItems = async () => {
    setLoading(true);
    
    const { data, error } = await safeSupabaseQuery(async () => {
      const result = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_date', { ascending: true });
      return result;
    });

    if (error) {
      console.error('Failed to fetch content:', error);
      toast({
        title: "Database Error",
        description: `Failed to fetch content: ${error}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setContentItems((data || []) as ContentItem[]);
    setLoading(false);
  };

  const addContentItem = async () => {
    if (!newContent.topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Topic is required",
        variant: "destructive",
      });
      return;
    }

    const insertData = {
      topic: newContent.topic,
      scheduled_date: newContent.scheduled_date,
      priority: newContent.priority,
      status: newContent.status,
      notes: newContent.notes,
      script_content: newContent.script_content,
      content_type: newContent.content_type,
      inspiration_links: newContent.inspiration_links
    };

    const { data, error } = await safeSupabaseQuery(async () => {
      const result = await supabase
        .from('content_calendar')
        .insert([insertData])
        .select();
      return result;
    });

    if (error) {
      console.error('Insert error:', error);
      toast({
        title: "Database Error",
        description: `Failed to add content: ${error}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content added to calendar",
    });

    setIsDialogOpen(false);
    setNewContent({
      topic: '',
      scheduled_date: '',
      status: 'planned',
      priority: 1,
      notes: '',
      script_content: '',
      content_type: 'reel',
      inspiration_links: ''
    });
    
    fetchContentItems();
  };

  const updateContentStatus = async (id: string, newStatus: ContentItem['status']) => {
    const { error } = await safeSupabaseQuery(async () => {
      const result = await supabase
        .from('content_calendar')
        .update({ status: newStatus })
        .eq('id', id)
        .select();
      return result;
    });

    if (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content status updated",
    });

    fetchContentItems();
  };

  const deleteContentItem = async (id: string) => {
    const { error } = await safeSupabaseQuery(async () => {
      const result = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id)
        .select();
      return result;
    });

    if (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content deleted",
    });

    fetchContentItems();
  };

  const getContentForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return contentItems.filter(item => item.scheduled_date === dateStr);
  };

  const generateIdeasForDay = async (dayName: string) => {
    setGeneratingIdeas(dayName);
    
    const webhookUrl = 'https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c';
    const payload = { day: dayName };
    
    const dayIndex = dayNames.indexOf(dayName);
    const selectedDayDate = weekDates[dayIndex];
    const dateStr = selectedDayDate.toISOString().split('T')[0];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.text();
        
        let parsedIdeas = [];
        try {
          const jsonResult = JSON.parse(result);
          if (Array.isArray(jsonResult)) {
            parsedIdeas = jsonResult;
          } else if (jsonResult.ideas && Array.isArray(jsonResult.ideas)) {
            parsedIdeas = jsonResult.ideas;
          } else {
            parsedIdeas = [{ title: jsonResult.title || result, description: jsonResult.description || '' }];
          }
        } catch (jsonError) {
          const lines = result.split('\n').filter(line => line.trim());
          parsedIdeas = lines.map((line, index) => ({
            title: line.trim(),
            description: `Generated idea ${index + 1} for ${dayName}`
          }));
        }
        
        let successCount = 0;
        for (const idea of parsedIdeas) {
          const title = idea.title || idea.topic || idea.name || 'Generated Idea';
          if (title.trim()) {
            const insertData = {
              topic: title.trim(),
              scheduled_date: dateStr,
              priority: 1,
              notes: idea.description || idea.notes || `AI generated idea for ${dayName}`,
              status: 'planned' as const,
              content_type: 'reel' as const,
              inspiration_links: ''
            };

            const { data, error } = await safeSupabaseQuery(async () => {
              const result = await supabase
                .from('content_calendar')
                .insert(insertData)
                .select();
              return result;
            });

            if (!error) {
              successCount++;
            }
          }
        }

        if (successCount > 0) {
          toast({
            title: "Success!",
            description: `Generated ${successCount} idea${successCount > 1 ? 's' : ''} for ${dayName}`,
          });
          
          fetchContentItems();
        } else {
          throw new Error('No valid ideas could be created from the response');
        }
        
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      let errorMessage = `Failed to generate ideas for ${dayName}`;
      
      if (error.name === 'AbortError') {
        errorMessage += ' (Request timed out)';
      } else if (error.message.includes('CORS')) {
        errorMessage += ' (CORS error)';
      } else if (error.message.includes('NetworkError')) {
        errorMessage += ' (Network error)';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += ' (Connection failed)';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGeneratingIdeas(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading calendar..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#f97316"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kaira-dashboard')}
                className="text-orange-700 hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-orange-900">Content Calendar</h1>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={!isConnected}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Content Topic *</Label>
                    <Input
                      id="topic"
                      value={newContent.topic}
                      onChange={(e) => setNewContent({...newContent, topic: e.target.value})}
                      placeholder="Enter your content topic"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Scheduled Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newContent.scheduled_date}
                      onChange={(e) => setNewContent({...newContent, scheduled_date: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content_type">Content Type *</Label>
                    <Select
                      value={newContent.content_type}
                      onValueChange={(value: ContentItem['content_type']) => 
                        setNewContent({...newContent, content_type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reel">🎬 Reel</SelectItem>
                        <SelectItem value="story">📸 Story</SelectItem>
                        <SelectItem value="carousel">🖼️ Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newContent.status}
                        onValueChange={(value: ContentItem['status']) => 
                          setNewContent({...newContent, status: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="script_ready">Script Ready</SelectItem>
                          <SelectItem value="in_production">In Production</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newContent.priority.toString()}
                        onValueChange={(value) => 
                          setNewContent({...newContent, priority: parseInt(value) as ContentItem['priority']})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Medium</SelectItem>
                          <SelectItem value="3">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="script">Script Content</Label>
                    <Textarea
                      id="script"
                      value={newContent.script_content}
                      onChange={(e) => setNewContent({...newContent, script_content: e.target.value})}
                      placeholder="Write your script here..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inspiration">Inspiration Links</Label>
                    <Textarea
                      id="inspiration"
                      value={newContent.inspiration_links}
                      onChange={(e) => setNewContent({...newContent, inspiration_links: e.target.value})}
                      placeholder="Add inspiration links, references, or ideas..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newContent.notes}
                      onChange={(e) => setNewContent({...newContent, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={addContentItem} 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={!newContent.topic.trim() || !newContent.scheduled_date}
                  >
                    Add Content
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConnectionStatus onConnectionChange={setIsConnected} />
        
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayContent = getContentForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="min-h-[400px]">
                <div className={`bg-white/20 backdrop-blur-sm rounded-lg border ${isToday ? 'border-orange-400 ring-2 ring-orange-400' : 'border-white/30'} p-4 h-full`}>
                  <div className="text-center mb-4">
                    <div className="text-sm font-medium text-orange-800">{dayNames[index]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-orange-600' : 'text-orange-900'}`}>
                      {date.getDate()}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateIdeasForDay(dayNames[index])}
                      disabled={generatingIdeas === dayNames[index]}
                      className="mt-2 h-7 text-xs bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700"
                    >
                      {generatingIdeas === dayNames[index] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Generate Ideas"
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {dayContent.map((item) => (
                      <div key={item.id} className={`p-3 bg-white rounded-lg shadow-sm border-l-4 ${priorityColors[item.priority]} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{contentTypeIcons[item.content_type]}</span>
                              <h4 className="font-medium text-gray-900 text-sm">{item.topic}</h4>
                              <Badge className={`text-xs ${statusColors[item.status]}`}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${contentTypeColors[item.content_type]}`}>
                                {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                              </Badge>
                            </div>
                            
                            {item.notes && (
                              <p className="text-xs text-gray-600 mb-2">{item.notes}</p>
                            )}
                            
                            {item.script_content && (
                              <p className="text-xs text-gray-500 mb-2">📝 Script ready</p>
                            )}
                            
                            {item.inspiration_links && (
                              <p className="text-xs text-gray-500">🔗 Inspiration saved</p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'approved')}>
                                Mark Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'script_ready')}>
                                Mark Script Ready
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'in_production')}>
                                Mark In Production
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'published')}>
                                Mark Published
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteContentItem(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KairaCalendar;