
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  priority: number;
  notes?: string;
  script_content?: string;
  content_source?: 'manual' | 'generated';
  category?: 'Real Estate News' | 'Entertainment' | 'Educational';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  topic_id?: string;
}

const statusColors = {
  planned: 'bg-slate-100 text-slate-800',
  approved: 'bg-blue-100 text-blue-800',
  script_ready: 'bg-yellow-100 text-yellow-800',
  in_production: 'bg-purple-100 text-purple-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const priorityColors = {
  1: 'border-l-green-500',
  2: 'border-l-yellow-500',
  3: 'border-l-red-500'
};

const categoryColors = {
  'Real Estate News': 'bg-blue-100 text-blue-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Educational': 'bg-emerald-100 text-emerald-800'
};

const KairaCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<1 | 2 | 3>(1);
  const [newCategory, setNewCategory] = useState<'Real Estate News' | 'Entertainment' | 'Educational'>('Entertainment');
  const [isConnected, setIsConnected] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState<string | null>(null);

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
    if (!newTopic.trim()) {
      toast({
        title: "Validation Error",
        description: "Topic is required",
        variant: "destructive",
      });
      return;
    }

    const insertData = {
      topic: newTopic,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      priority: newPriority,
      notes: newNotes || null,
      status: 'planned' as const,
      content_source: 'manual',
      category: newCategory
    };

    const { data, error } = await safeSupabaseQuery(async () => {
      const result = await supabase
        .from('content_calendar')
        .insert(insertData)
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
    setNewTopic('');
    setNewNotes('');
    setNewPriority(1);
    setNewCategory('Entertainment');
    
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
    console.log('🚀 generateIdeasForDay called with:', dayName);
    console.log('🔗 Connection status:', isConnected);
    console.log('⏳ Currently generating for:', generatingIdeas);
    
    setGeneratingIdeas(dayName);
    
    const webhookUrl = 'https://n8n.srv905291.hstgr.cloud/webhook/cd662191-3c6e-4542-bb4e-e75e3b16009c';
    const payload = { day: dayName };
    
    console.log('📤 Sending request to:', webhookUrl);
    console.log('📦 Payload:', payload);
    
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.text();
        console.log('✅ Success! Ideas generated for', dayName, ':', result);
        toast({
          title: "Success",
          description: `Ideas generated for ${dayName}`,
        });
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, response.statusText, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Network/Request Error for', dayName, ':', error);
      
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
      console.log('🏁 Finished processing for:', dayName);
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Topic</label>
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Enter video topic..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <Input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newPriority.toString()} onValueChange={(value) => setNewPriority(parseInt(value) as 1 | 2 | 3)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newCategory} onValueChange={(value) => setNewCategory(value as 'Real Estate News' | 'Entertainment' | 'Educational')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Real Estate News">Real Estate News</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Add any notes..."
                    />
                  </div>
                  <Button 
                    onClick={addContentItem} 
                    className="w-full bg-orange-600 hover:bg-orange-700"
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
              <div key={index} className="min-h-[300px]">
                <div className={`bg-white/20 backdrop-blur-sm rounded-lg border ${isToday ? 'border-orange-400 ring-2 ring-orange-400' : 'border-white/30'} p-4`}>
                  <div className="text-center mb-4">
                    <div className="text-sm font-medium text-orange-800">{dayNames[index]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-orange-600' : 'text-orange-900'}`}>
                      {date.getDate()}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateIdeasForDay(dayNames[index])}
                      disabled={!isConnected || generatingIdeas === dayNames[index]}
                      className="mt-2 h-7 text-xs bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700"
                    >
                      {generatingIdeas === dayNames[index] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Generate Ideas"
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {dayContent.map((item) => (
                      <Card key={item.id} className={`${priorityColors[item.priority]} border-l-4 bg-white/80 backdrop-blur-sm`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.topic}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                <Badge className={`text-xs ${statusColors[item.status]}`}>
                                  {item.status.replace('_', ' ')}
                                </Badge>
                                {item.category && (
                                  <Badge className={`text-xs ${categoryColors[item.category]}`}>
                                    {item.category}
                                  </Badge>
                                )}
                                {item.content_source === 'generated' && (
                                  <Badge className="text-xs bg-purple-100 text-purple-800">
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'approved')}>
                                  Mark as Approved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'script_ready')}>
                                  Mark Script Ready
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'published')}>
                                  Mark as Published
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
                          {item.notes && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
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
