import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, Sparkles, ArrowLeft, Edit3, Check, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Script {
  label: string;
  content: string;
}

interface ScriptResponse {
  title: string;
  scripts: Script[];
}

const Script = () => {
  const [topic, setTopic] = useState('');
  const [scriptData, setScriptData] = useState<ScriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScriptIndex, setEditingScriptIndex] = useState<number | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [manualEditContent, setManualEditContent] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [calendarFormData, setCalendarFormData] = useState({
    scheduled_date: '',
    priority: 1,
    content_type: 'reel' as 'reel' | 'story' | 'carousel',
    notes: '',
    inspiration_links: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const selectedIdea = localStorage.getItem('selectedIdea');
    if (selectedIdea) {
      setTopic(selectedIdea);
      localStorage.removeItem('selectedIdea');
    }
  }, []);

  const generateScriptInEnglish = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please provide a topic or idea for script generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Generating script for topic:", topic);
    
    try {
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/9562157b-c2d8-4e1f-a79e-03bd7c3337a2?message=${encodeURIComponent(topic)}`, {
        method: 'GET',
      });

      const data = await response.json();
      console.log("Script webhook response:", data);
      
      if (data.output && typeof data.output === 'object') {
        setScriptData(data.output);
        toast({
          title: "Scripts Generated!",
          description: `Created ${data.output.scripts?.length || 0} script variations for you.`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate scripts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateScriptInHindi = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please provide a topic or idea for script generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Generating script for topic:", topic, "in Hindi");
    
    try {
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/9562157b-c2d8-4e1f-a79e-03bd7c3337a2?message=${encodeURIComponent(topic)}&language=Hindi`, {
        method: 'GET',
      });

      const data = await response.json();
      console.log("Script webhook response:", data);
      
      if (data.output && typeof data.output === 'object') {
        setScriptData(data.output);
        toast({
          title: "Scripts Generated!",
          description: `Created ${data.output.scripts?.length || 0} script variations for you.`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate scripts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseThis = (script: Script) => {
    setSelectedScript(script);
    toast({
      title: "Script Selected!",
      description: "Click 'Save & Continue' when you're ready to proceed.",
    });
  };

  const handleEditThis = (script: Script, index: number) => {
    setEditingScriptIndex(index);
    setManualEditContent(script.content);
    setEditInstruction('');
    setIsManualEdit(false);
  };

  const handleApplyChanges = async () => {
    if (editingScriptIndex === null || !scriptData) return;

    if (isManualEdit) {
      // Apply manual edits
      const updatedScripts = [...scriptData.scripts];
      updatedScripts[editingScriptIndex] = {
        ...updatedScripts[editingScriptIndex],
        content: manualEditContent
      };
      setScriptData({ ...scriptData, scripts: updatedScripts });
      setEditingScriptIndex(null);
      toast({
        title: "Manual Edit Applied!",
        description: "Your changes have been saved.",
      });
    } else {
      // AI refinement
      if (!editInstruction.trim()) {
        toast({
          title: "Instruction Required",
          description: "Please provide instructions for refining the script.",
          variant: "destructive",
        });
        return;
      }

      setIsRefining(true);
      try {
        const currentScript = scriptData.scripts[editingScriptIndex];
        const url = `https://n8n.srv905291.hstgr.cloud/webhook/5aa1c5b5-da7e-4720-b862-c858abf81951?script=${encodeURIComponent(currentScript.content)}&instruction=${encodeURIComponent(editInstruction)}&topic=${encodeURIComponent(topic)}`;
        
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        
        let refinedScript = '';
        if (data.output && typeof data.output === 'string') {
          refinedScript = data.output;
        } else if (data.script) {
          refinedScript = data.script;
        } else if (typeof data === 'string') {
          refinedScript = data;
        } else {
          throw new Error('Invalid response format');
        }

        const updatedScripts = [...scriptData.scripts];
        updatedScripts[editingScriptIndex] = {
          ...updatedScripts[editingScriptIndex],
          content: refinedScript,
          label: `${updatedScripts[editingScriptIndex].label} (Edited)`
        };
        setScriptData({ ...scriptData, scripts: updatedScripts });
        setEditingScriptIndex(null);
        setEditInstruction('');
        
        toast({
          title: "Script Refined!",
          description: "AI has updated your script based on your instructions.",
        });
      } catch (error) {
        console.error('Error refining script:', error);
        toast({
          title: "Error",
          description: "Failed to refine script. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRefining(false);
      }
    }
  };

  const handleSaveAndContinue = async () => {
    if (!selectedScript) return;

    if (!calendarFormData.scheduled_date.trim()) {
      toast({
        title: "Validation Error",
        description: "Scheduled date is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      // Parse topic to extract title if it's JSON
      let topicTitle = topic;
      try {
        const parsed = JSON.parse(topic);
        if (parsed.title) {
          topicTitle = parsed.title;
        }
      } catch {
        // If not JSON, use as-is
        topicTitle = topic;
      }

      const { error } = await supabase
        .from('content_calendar')
        .insert({
          user_id: user.id,
          topic: topicTitle,
          script_content: selectedScript.content,
          scheduled_date: calendarFormData.scheduled_date,
          status: 'pending_approval',
          priority: calendarFormData.priority,
          content_type: calendarFormData.content_type,
          notes: calendarFormData.notes,
          inspiration_links: calendarFormData.inspiration_links,
          category: 'Business/Finance',
          content_source: 'generated'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Script sent for approval",
      });

      setShowSaveDialog(false);
      navigate('/aisha-calendar');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Error",
        description: "Failed to save script",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="relative z-20 w-full py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/aisha-dashboard')}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Aisha's Studio</span>
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
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-blue-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-purple-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-2xl mb-3 sm:mb-0 sm:mr-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 text-center">
              AI Script Generator
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your ideas into compelling video scripts with multiple variations
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mx-4 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="text-gray-900 text-base sm:text-lg font-medium">
                    Provide a topic or idea to generate a script
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your video topic or idea..."
                    className="mt-2 bg-white/50 border-blue-200 text-gray-900 placeholder:text-gray-500 text-base sm:text-lg p-3 sm:p-4"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    onClick={generateScriptInEnglish}
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        Generate Script in English
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={generateScriptInHindi}
                    disabled={isLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        Generate Script in Hindi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {scriptData && (
          <div className="max-w-6xl mx-auto animate-fade-in px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              {scriptData.title}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {scriptData.scripts?.map((script, index) => (
                <Card 
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm border-blue-100 transition-all duration-300 h-full cursor-pointer hover:scale-105 hover:shadow-2xl ${
                    selectedScript?.label === script.label ? 'ring-2 ring-blue-500 border-blue-300' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900 text-lg sm:text-xl flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-2">{script.label}</span>
                      </div>
                      {selectedScript?.label === script.label && (
                        <Badge className="bg-blue-500 text-white ml-2 flex-shrink-0">Selected</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 flex flex-col h-full">
                    <div className="bg-gray-50/80 rounded-lg p-3 sm:p-4 mb-4 flex-grow overflow-y-auto max-h-60 sm:max-h-80">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {script.content}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <Button
                        onClick={() => handleUseThis(script)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-full py-3 px-4 text-sm sm:text-base font-medium"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Use This
                      </Button>
                      <Button
                        onClick={() => handleEditThis(script, index)}
                        variant="outline"
                        className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full py-3 px-4 text-sm sm:text-base font-medium"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit This
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Save & Continue Button */}
        {selectedScript && scriptData && (
          <div className="max-w-6xl mx-auto mt-12 px-4 sm:px-0 animate-fade-in">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-blue-100">
              <p className="text-gray-700 text-lg mb-6">
                Script Selected! Click below to save to your content calendar.
              </p>
              <Button
                onClick={() => setShowSaveDialog(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-16 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover:scale-105"
              >
                <Check className="w-7 h-7 mr-3" />
                Save to Content Calendar
              </Button>
            </div>
          </div>
        )}

        {/* Save to Calendar Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save to Content Calendar</DialogTitle>
              <DialogDescription>
                Schedule this script and add additional details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Topic</Label>
                <Input value={topic} disabled className="bg-gray-50" />
              </div>
              
              <div>
                <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={calendarFormData.scheduled_date}
                  onChange={(e) => setCalendarFormData({...calendarFormData, scheduled_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={calendarFormData.content_type}
                  onValueChange={(value: 'reel' | 'story' | 'carousel') => 
                    setCalendarFormData({...calendarFormData, content_type: value})
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
                  value={calendarFormData.priority.toString()}
                  onValueChange={(value) => 
                    setCalendarFormData({...calendarFormData, priority: parseInt(value)})
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
                  value={calendarFormData.notes}
                  onChange={(e) => setCalendarFormData({...calendarFormData, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="inspiration_links">Inspiration Links</Label>
                <Textarea
                  id="inspiration_links"
                  value={calendarFormData.inspiration_links}
                  onChange={(e) => setCalendarFormData({...calendarFormData, inspiration_links: e.target.value})}
                  placeholder="Add links for inspiration..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleSaveAndContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                Send for Approval
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}

        {/* Edit Dialog */}
        <Dialog open={editingScriptIndex !== null} onOpenChange={() => setEditingScriptIndex(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-600">Edit Script</DialogTitle>
              <DialogDescription>
                {isManualEdit ? 'Make direct changes to your script' : 'Provide instructions for AI to refine your script'}
              </DialogDescription>
            </DialogHeader>
            
            {editingScriptIndex !== null && scriptData && (
              <div className="space-y-4 mt-4">
                {/* Current Script Display */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">Current Script</Label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {scriptData.scripts[editingScriptIndex].content}
                    </p>
                  </div>
                </div>

                {/* Edit Mode Toggle */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <Button
                    variant={!isManualEdit ? "default" : "outline"}
                    onClick={() => setIsManualEdit(false)}
                    className={!isManualEdit ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Prompt
                  </Button>
                  <Button
                    variant={isManualEdit ? "default" : "outline"}
                    onClick={() => setIsManualEdit(true)}
                    className={isManualEdit ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Manual Edit
                  </Button>
                </div>

                {/* Edit Area */}
                {isManualEdit ? (
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Edit Script Directly</Label>
                    <Textarea
                      value={manualEditContent}
                      onChange={(e) => setManualEditContent(e.target.value)}
                      placeholder="Edit your script here..."
                      className="min-h-[300px] text-base"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-base font-semibold mb-2 block">AI Instructions</Label>
                    <Textarea
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      placeholder="E.g., Make this funnier, Add more statistics, Make it more professional..."
                      className="min-h-[150px] text-base"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Tell AI how you want to improve the script
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingScriptIndex(null)}
                    disabled={isRefining}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApplyChanges}
                    disabled={isRefining || (!isManualEdit && !editInstruction.trim())}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isRefining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Refining...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Apply Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {!scriptData && !isLoading && (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <FileText className="w-full h-full" />
            </div>
            <p className="text-xl">Enter your topic above to generate compelling scripts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Script;
