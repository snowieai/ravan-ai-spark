import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, FileText, Sparkles, RefreshCw, Edit3, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface Script {
  label: string;
  content: string;
}

interface ScriptResponse {
  title: string;
  scripts: Script[];
}

const BaileyScript = () => {
  const navigate = useNavigate();
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [scriptData, setScriptData] = useState<ScriptResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    // Auth check now handled by ProtectedRoute, only check influencer selection
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    const idea = localStorage.getItem('selectedIdea');
    
    if (selectedInfluencer !== 'bailey') {
      navigate('/influencers');
      return;
    }

    if (idea) {
      setSelectedIdea(idea);
      generateScript(idea);
    } else {
      navigate('/bailey-ideas');
    }
  }, [navigate]);

  const generateScript = async (idea: string) => {
    setIsGenerating(true);
    setProgress(0);
    
    // Animate progress over 2 minutes
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 0.8;
      });
    }, 1000);

    try {
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1?message=${encodeURIComponent(idea)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      console.log('==================== BAILEY SCRIPT WEBHOOK RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('======================================================================');
      
      // Handle script generation response similar to Kaira/Aisha
      if (data && data.output && typeof data.output === 'object') {
        setScriptData(data.output);
        toast({
          title: "Scripts Generated!",
          description: `Bailey created ${data.output.scripts?.length || 0} script variations for you.`,
        });
      } else {
        throw new Error('Invalid response format');
      }

      setProgress(100);
      
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
      
      // Set fallback script data
      setScriptData({
        title: "Fallback Real Estate Scripts",
        scripts: [
          {
            label: "Script A - Market Insights",
            content: `Hey everyone! Welcome back to Bailey's Real Estate Corner! 

Today I want to talk about: ${idea}

[INTRO HOOK]
Did you know that the Australian real estate market is constantly evolving? Today I'm sharing some insights that could help you make better property decisions.

[MAIN CONTENT]
Let me break this down for you in simple terms...

[CALL TO ACTION]
If you found this helpful, make sure to follow for more real estate tips and market insights. And remember, if you're thinking of buying or selling, I'm here to help!

What questions do you have about the current market? Drop them in the comments below!

#RealEstate #PropertyTips #AustraliaProperty #RealEstateAgent`
          },
          {
            label: "Script B - Quick Tips",
            content: `G'day property enthusiasts! Bailey here with another real estate update!

Today's topic: ${idea}

[HOOK]
The property market waits for no one - and today I've got insights that could save you thousands!

[CONTENT]
Here's what you need to know...

[CLOSING]
Found this valuable? Hit that follow button and share with someone who needs to see this! And if you're ready to make your next property move, let's chat!

Drop a 🏠 if you're ready to take action!

#PropertyExpert #RealEstateAustralia #PropertyTips #Bailey`
          }
        ]
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
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
        const url = `https://n8n.srv905291.hstgr.cloud/webhook/5aa1c5b5-da7e-4720-b862-c858abf81951?script=${encodeURIComponent(currentScript.content)}&instruction=${encodeURIComponent(editInstruction)}&topic=${encodeURIComponent(selectedIdea)}`;
        
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

  const getCategoryForDate = (date: string): string => {
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    switch (dayOfWeek) {
      case 1: // Monday
        return 'Real Estate Interactive';
      case 3: // Wednesday
        return 'Real Estate News';
      case 5: // Friday
        return 'Trending (Country-wise)';
      case 6: // Saturday
        return 'Viral Content';
      default: // Sunday (0), Tuesday (2), Thursday (4) - off days
        return 'Real Estate News'; // Default fallback
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

      // Parse selectedIdea to extract title if it's JSON
      let topicTitle = selectedIdea;
      try {
        const parsed = JSON.parse(selectedIdea);
        if (parsed.title) {
          topicTitle = parsed.title;
        }
      } catch {
        // If not JSON, use as-is
        topicTitle = selectedIdea;
      }

      const { data, error } = await supabase
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
          category: getCategoryForDate(calendarFormData.scheduled_date),
          content_source: 'generated',
          influencer_name: 'bailey',
          approval_status: 'pending',
          submitted_for_approval_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      // Notify admins about pending script
      try {
        await supabase.functions.invoke('notify-admins-pending-script', {
          body: {
            scriptId: data?.[0]?.id,
            influencer: 'bailey',
            scheduledDate: calendarFormData.scheduled_date,
            topic: topicTitle
          }
        });
      } catch (notifyError) {
        console.error('Failed to notify admins:', notifyError);
      }

      toast({
        title: "Success",
        description: "Script sent for admin approval",
      });

      setShowSaveDialog(false);
      navigate('/bailey-calendar');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Error",
        description: "Failed to save script",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = () => {
    if (selectedIdea) {
      generateScript(selectedIdea);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedInfluencer');
    localStorage.removeItem('selectedIdea');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleBackToIdeas = () => {
    navigate('/bailey-ideas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToIdeas}
              variant="outline"
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ideas
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
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-teal-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Bailey Profile Section */}
        <div className="text-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 w-full mx-auto shadow-lg border border-white/40 mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/lovable-uploads/a8037233-c2be-4b97-8739-3631486f9761.png" 
                alt="Bailey Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bailey</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium text-sm">Australia's Premier AI Real Estate Agent</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-emerald-500 p-3 rounded-2xl mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Video Script
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            AI-generated video script based on your selected idea
          </p>
        </div>

        {/* Selected Idea */}
        {selectedIdea && (
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-emerald-700">Selected Idea:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{selectedIdea}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Script Content */}
        {isGenerating ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <p className="text-gray-600 mb-2">Generating your video scripts...</p>
            <p className="text-emerald-600 font-semibold">{Math.round(progress)}%</p>
          </div>
        ) : scriptData ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 mr-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Scripts
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {scriptData.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scriptData.scripts?.map((script, index) => (
                <Card 
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm border-emerald-100 transition-all duration-300 h-full cursor-pointer hover:scale-105 hover:shadow-2xl ${
                    selectedScript?.label === script.label ? 'ring-2 ring-emerald-500 border-emerald-300' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900 text-xl flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="w-6 h-6 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="line-clamp-2">{script.label}</span>
                      </div>
                      {selectedScript?.label === script.label && (
                        <Badge className="bg-emerald-500 text-white ml-2 flex-shrink-0">Selected</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col h-full">
                    <div className="bg-gray-50/80 rounded-lg p-5 mb-6 flex-grow overflow-y-auto" style={{ maxHeight: '400px', minHeight: '200px' }}>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                        {script.content}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-auto">
                      <Button
                        onClick={() => handleUseThis(script)}
                        size="lg"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Use This Script
                      </Button>
                      <Button
                        onClick={() => handleEditThis(script, index)}
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-full py-4 text-base font-semibold transition-all"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Edit This Script
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <FileText className="w-full h-full" />
            </div>
            <p className="text-xl">No scripts generated yet.</p>
          </div>
        )}

        {/* Save & Continue Button */}
        {selectedScript && scriptData && (
          <div className="max-w-6xl mx-auto mt-12 px-4 sm:px-0 animate-fade-in">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-pink-100">
              <p className="text-gray-700 text-lg mb-6">
                Script Selected! Click below to save to your content calendar.
              </p>
              <Button
                onClick={() => setShowSaveDialog(true)}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-16 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover:scale-105"
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
                <Input value={selectedIdea} disabled className="bg-gray-50" />
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
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 text-lg"
              >
                Send for Approval
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editingScriptIndex !== null} onOpenChange={() => setEditingScriptIndex(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-emerald-600">Edit Script</DialogTitle>
              <DialogDescription>
                {isManualEdit ? 'Make direct changes to your script' : 'Provide instructions for AI to refine your script'}
              </DialogDescription>
            </DialogHeader>
            
            {editingScriptIndex !== null && scriptData && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Current Script</Label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {scriptData.scripts[editingScriptIndex].content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                  <Button
                    variant={!isManualEdit ? "default" : "outline"}
                    onClick={() => setIsManualEdit(false)}
                    className={!isManualEdit ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Prompt
                  </Button>
                  <Button
                    variant={isManualEdit ? "default" : "outline"}
                    onClick={() => setIsManualEdit(true)}
                    className={isManualEdit ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Manual Edit
                  </Button>
                </div>

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
                      placeholder="E.g., Make this more engaging, Add market statistics, Focus on buyer benefits..."
                      className="min-h-[150px] text-base"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Tell AI how you want to improve the script
                    </p>
                  </div>
                )}

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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
      </div>
    </div>
  );
};

export default BaileyScript;