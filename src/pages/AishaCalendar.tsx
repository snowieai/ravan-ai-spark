import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, MoreVertical, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
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
  status: 'planned' | 'approved' | 'pending_approval' | 'script_ready' | 'in_production' | 'published' | 'cancelled';
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
  pending_approval: "bg-amber-100 text-amber-800",
  script_ready: "bg-yellow-100 text-yellow-800",
  in_production: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const categoryColors = {
  'Real Estate News': 'bg-blue-100 text-blue-800 border-blue-200',
  'Real Estate Interactive': 'bg-purple-100 text-purple-800 border-purple-200',
  'Trending (Country-wise)': 'bg-orange-100 text-orange-800 border-orange-200',
  'Viral Content': 'bg-pink-100 text-pink-800 border-pink-200',
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

const AishaCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
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

  const getMonthCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = getMonthCalendarDates();
  
  const weeks = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    weeks.push(calendarDates.slice(i, i + 7));
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

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
    const { error} = await safeSupabaseQuery(async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading calendar..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#3b82f6"
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
                onClick={() => navigate('/aisha-dashboard')}
                className="text-blue-700 hover:bg-blue-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-blue-900">Content Calendar</h1>
              </div>
              <div className="flex items-center space-x-2 ml-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-blue-900 min-w-[140px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                        <SelectItem value="1">🔴 High Priority</SelectItem>
                        <SelectItem value="2">🟡 Medium Priority</SelectItem>
                        <SelectItem value="3">🟢 Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newContent.notes}
                      onChange={(e) => setNewContent({...newContent, notes: e.target.value})}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inspiration_links">Inspiration Links</Label>
                    <Textarea
                      id="inspiration_links"
                      value={newContent.inspiration_links}
                      onChange={(e) => setNewContent({...newContent, inspiration_links: e.target.value})}
                      placeholder="Add links for inspiration..."
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={addContentItem}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add to Calendar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="relative z-10">
        <ConnectionStatus onConnectionChange={setIsConnected} />
      </div>

      {/* Calendar Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-blue-100 bg-blue-50">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-blue-900 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Weeks */}
          <div className="divide-y divide-blue-100">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 divide-x divide-blue-100">
                {week.map((date, dayIndex) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const dayContent = getContentForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[120px] p-2 ${
                        isCurrentMonth ? 'bg-white' : 'bg-blue-50/30'
                      } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''} hover:bg-blue-50/50 transition-colors`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600' : ''}`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayContent.map(item => (
                          <div key={item.id}>
                            <div 
                              className={`text-xs p-1.5 rounded cursor-pointer border-l-2 ${priorityColors[item.priority]} ${statusColors[item.status]} hover:opacity-80 transition-opacity`}
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailDialog(true);
                              }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate flex-1">{item.topic}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-4 w-4 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white z-50">
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'approved')}>
                                Mark as Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateContentStatus(item.id, 'in_production')}>
                                Move to Production
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-100 rounded"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 rounded"></div>
              <span>Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span>Script Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded"></div>
              <span>In Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Published</span>
          </div>
        </div>
      </div>

      {/* Content Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-900">Content Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Topic</Label>
                <p className="mt-1 text-base text-gray-900">{selectedItem.topic}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedItem.status]}>
                      {selectedItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Content Type</Label>
                  <div className="mt-1">
                    <Badge className={contentTypeColors[selectedItem.content_type]}>
                      {contentTypeIcons[selectedItem.content_type]} {selectedItem.content_type.charAt(0).toUpperCase() + selectedItem.content_type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Scheduled Date</Label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(selectedItem.scheduled_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Priority</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[selectedItem.priority].replace('border-l-', 'bg-')}`}></div>
                    <span className="text-base text-gray-900">Priority {selectedItem.priority}</span>
                  </div>
                </div>
              </div>

              {selectedItem.category && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Category</Label>
                  <div className="mt-1">
                    <Badge className={categoryColors[selectedItem.category as keyof typeof categoryColors]}>
                      {selectedItem.category}
                    </Badge>
                  </div>
                </div>
              )}

              {selectedItem.script_content && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Script Content</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedItem.script_content}</p>
                  </div>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Notes</Label>
                  <div className="mt-1 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedItem.notes}</p>
                  </div>
                </div>
              )}

              {selectedItem.inspiration_links && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Inspiration Links</Label>
                  <div className="mt-1 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-900 break-all">{selectedItem.inspiration_links}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AishaCalendar;
