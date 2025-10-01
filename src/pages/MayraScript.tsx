import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Home, LogOut, Loader2, ArrowLeft, Edit3, Check, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface ScriptData {
  scriptA: string;
  scriptB: string;
  title?: string;
}

const MayraScript = () => {
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [selectedScript, setSelectedScript] = useState<'A' | 'B' | null>(null);
  const [editingScript, setEditingScript] = useState<'A' | 'B' | null>(null);
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
    // Auth check now handled by ProtectedRoute, only check influencer selection
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    const idea = localStorage.getItem('selectedIdea');
    
    if (selectedInfluencer !== 'mayra') {
      navigate('/influencers');
      return;
    }
    
    if (idea) {
      setSelectedIdea(idea);
      // Auto-generate script when idea is selected
      generateScriptForIdea(idea);
    }
  }, [navigate]);

  const generateScriptForIdea = async (idea: string) => {
    setIsLoading(true);
    try {
      console.log('Generating script for Mayra with idea:', idea);
      
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Generate Script&idea=${encodeURIComponent(idea)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('==================== MAYRA SCRIPT GENERATION RESPONSE ====================');
      console.log('Full raw response:', JSON.stringify(data, null, 2));
      console.log('Response type:', typeof data);
      console.log('Response keys:', data && typeof data === 'object' ? Object.keys(data) : 'Not an object');
      console.log('======================================================================');
      
      // Handle multiple possible response formats
      let scriptA = '';
      let scriptB = '';
      let title = 'Generated A/B Scripts';
      
      // Check for direct scriptA/scriptB properties
      if (data && data.scriptA && data.scriptB) {
        console.log('✅ Found direct scriptA and scriptB properties');
        scriptA = data.scriptA;
        scriptB = data.scriptB;
        title = data.title || title;
      }
      // Check if response has output property (like Bailey)
      else if (data && data.output && data.output.scriptA && data.output.scriptB) {
        console.log('✅ Found scripts in output property');
        scriptA = data.output.scriptA;
        scriptB = data.output.scriptB;
        title = data.output.title || title;
      }
      // Check if response has scripts array (like Bailey's format)
      else if (data && data.output && data.output.scripts && Array.isArray(data.output.scripts)) {
        console.log('✅ Found scripts array format');
        const scripts = data.output.scripts;
        scriptA = scripts[0]?.content || scripts[0]?.script || '';
        scriptB = scripts[1]?.content || scripts[1]?.script || scriptA;
        title = data.output.title || title;
      }
      // Check for any property that might contain scripts as string
      else if (data && typeof data === 'object') {
        console.log('🔍 Searching for script content in response...');
        const allValues = Object.values(data);
        
        for (const value of allValues) {
          if (typeof value === 'string' && value.length > 100) {
            console.log('✅ Found text content, treating as single script');
            scriptA = value;
            scriptB = value;
            break;
          }
          // Check nested objects
          else if (typeof value === 'object' && value !== null) {
            const nestedValues = Object.values(value);
            for (const nestedValue of nestedValues) {
              if (typeof nestedValue === 'string' && nestedValue.length > 100) {
                console.log('✅ Found nested text content');
                scriptA = nestedValue;
                scriptB = nestedValue;
                break;
              }
            }
            if (scriptA) break;
          }
        }
      }
      
      if (!scriptA || !scriptB) {
        console.log('❌ No valid scripts found in response');
        throw new Error('No scripts received from the API');
      }
      
      setScriptData({
        scriptA,
        scriptB,
        title
      });
      
      toast({
        title: "Scripts Generated!",
        description: "A/B tested scripts have been created successfully.",
      });
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

  const generateScript = async () => {
    if (!selectedIdea) {
      toast({
        title: "No Idea Selected",
        description: "Please select an idea first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Generating script for Mayra with idea:', selectedIdea);
      
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Generate Script&idea=${encodeURIComponent(selectedIdea)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Script generation response (manual):', data);
      
      // Use the same logic as auto-generation
      let scriptA = '';
      let scriptB = '';
      let title = 'Generated A/B Scripts';
      
      if (data && data.scriptA && data.scriptB) {
        scriptA = data.scriptA;
        scriptB = data.scriptB;
        title = data.title || title;
      } else if (data && data.output && data.output.scriptA && data.output.scriptB) {
        scriptA = data.output.scriptA;
        scriptB = data.output.scriptB;
        title = data.output.title || title;
      } else if (data && data.output && data.output.scripts && Array.isArray(data.output.scripts)) {
        const scripts = data.output.scripts;
        scriptA = scripts[0]?.content || scripts[0]?.script || '';
        scriptB = scripts[1]?.content || scripts[1]?.script || scriptA;
        title = data.output.title || title;
      } else if (data && typeof data === 'object') {
        const allValues = Object.values(data);
        for (const value of allValues) {
          if (typeof value === 'string' && value.length > 100) {
            scriptA = value;
            scriptB = value;
            break;
          } else if (typeof value === 'object' && value !== null) {
            const nestedValues = Object.values(value);
            for (const nestedValue of nestedValues) {
              if (typeof nestedValue === 'string' && nestedValue.length > 100) {
                scriptA = nestedValue;
                scriptB = nestedValue;
                break;
              }
            }
            if (scriptA) break;
          }
        }
      }
      
      if (!scriptA || !scriptB) {
        throw new Error('No scripts received from the API');
      }
      
      setScriptData({
        scriptA,
        scriptB,
        title
      });
      
      toast({
        title: "Scripts Generated!",
        description: "A/B tested scripts have been created successfully.",
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseThis = (version: 'A' | 'B') => {
    setSelectedScript(version);
    toast({
      title: "Script Selected!",
      description: `Script ${version} selected. Click 'Save & Continue' when ready.`,
    });
  };

  const handleEditThis = (version: 'A' | 'B') => {
    setEditingScript(version);
    const content = version === 'A' ? scriptData?.scriptA : scriptData?.scriptB;
    setManualEditContent(content || '');
    setEditInstruction('');
    setIsManualEdit(false);
  };

  const handleApplyChanges = async () => {
    if (!editingScript || !scriptData) return;

    if (isManualEdit) {
      const updatedData = { ...scriptData };
      if (editingScript === 'A') {
        updatedData.scriptA = manualEditContent;
      } else {
        updatedData.scriptB = manualEditContent;
      }
      setScriptData(updatedData);
      setEditingScript(null);
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
        const currentScript = editingScript === 'A' ? scriptData.scriptA : scriptData.scriptB;
        const url = `https://n8n.srv905291.hstgr.cloud/webhook/5aa1c5b5-da7e-4720-b862-c858abf81951?script=${encodeURIComponent(currentScript)}&instruction=${encodeURIComponent(editInstruction)}&topic=${encodeURIComponent(selectedIdea)}`;
        
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

        const updatedData = { ...scriptData };
        if (editingScript === 'A') {
          updatedData.scriptA = refinedScript;
        } else {
          updatedData.scriptB = refinedScript;
        }
        setScriptData(updatedData);
        setEditingScript(null);
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
    if (!selectedScript || !scriptData) return;

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

      const finalScript = selectedScript === 'A' ? scriptData.scriptA : scriptData.scriptB;
      
      const { data, error } = await supabase
        .from('content_calendar')
        .insert({
          user_id: user.id,
          topic: topicTitle,
          script_content: finalScript,
          scheduled_date: calendarFormData.scheduled_date,
          status: 'pending_approval',
          priority: calendarFormData.priority,
          content_type: calendarFormData.content_type,
          notes: calendarFormData.notes,
          inspiration_links: calendarFormData.inspiration_links,
          category: getCategoryForDate(calendarFormData.scheduled_date),
          content_source: 'generated',
          influencer_name: 'mayra',
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
            influencer: 'mayra',
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
      navigate('/mayra-calendar');
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Error",
        description: "Failed to save script",
        variant: "destructive",
      });
    }
  };

  const handleBackToIdeas = () => {
    navigate('/mayra-ideas');
  };

  const handleBackToDashboard = () => {
    navigate('/mayra-dashboard');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-yellow-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="flex items-center border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
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
              className="flex items-center border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-yellow-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Button
                onClick={handleBackToIdeas}
                variant="outline"
                className="mr-4 border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ideas
              </Button>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gray-900">Script </span>
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              Generate AI-powered video scripts for Mayra's content
            </p>
          </div>

          {/* Selected Idea Display */}
          {selectedIdea && (
            <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Selected Idea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{selectedIdea}</p>
                <Button
                  onClick={generateScript}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-3 rounded-full border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Scripts...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Generate A/B Scripts
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scripts Display */}
          {scriptData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Script A */}
                <Card className={`bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                  selectedScript === 'A' ? 'ring-2 ring-yellow-500 border-yellow-300' : ''
                }`}>
                  <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Script A
                      </div>
                      <div className="flex gap-2">
                        {selectedScript === 'A' && (
                          <Badge className="bg-yellow-500 text-white">Selected</Badge>
                        )}
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Version A
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 p-5 rounded-lg mb-6 overflow-y-auto" style={{ maxHeight: '400px', minHeight: '200px' }}>
                      <pre className="whitespace-pre-wrap text-base text-gray-800 font-mono leading-relaxed">
                        {scriptData.scriptA}
                      </pre>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => handleUseThis('A')}
                        size="lg"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-0 rounded-full py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Use This Script
                      </Button>
                      <Button
                        onClick={() => handleEditThis('A')}
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-full py-4 text-base font-semibold transition-all"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Edit This Script
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Script B */}
                <Card className={`bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                  selectedScript === 'B' ? 'ring-2 ring-yellow-500 border-yellow-300' : ''
                }`}>
                  <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Script B
                      </div>
                      <div className="flex gap-2">
                        {selectedScript === 'B' && (
                          <Badge className="bg-yellow-500 text-white">Selected</Badge>
                        )}
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Version B
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 p-5 rounded-lg mb-6 overflow-y-auto" style={{ maxHeight: '400px', minHeight: '200px' }}>
                      <pre className="whitespace-pre-wrap text-base text-gray-800 font-mono leading-relaxed">
                        {scriptData.scriptB}
                      </pre>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => handleUseThis('B')}
                        size="lg"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-0 rounded-full py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Use This Script
                      </Button>
                      <Button
                        onClick={() => handleEditThis('B')}
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-full py-4 text-base font-semibold transition-all"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Edit This Script
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Save & Continue Button */}
          {selectedScript && scriptData && (
            <div className="max-w-6xl mx-auto mt-12 px-4 sm:px-0 animate-fade-in">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-green-100">
                <p className="text-gray-700 text-lg mb-6">
                  Script Selected! Click below to save to your content calendar.
                </p>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-16 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover:scale-105"
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                >
                  Send for Approval
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={editingScript !== null} onOpenChange={() => setEditingScript(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-yellow-600">Edit Script {editingScript}</DialogTitle>
                <DialogDescription>
                  {isManualEdit ? 'Make direct changes to your script' : 'Provide instructions for AI to refine your script'}
                </DialogDescription>
              </DialogHeader>
              
              {editingScript && scriptData && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Current Script</Label>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {editingScript === 'A' ? scriptData.scriptA : scriptData.scriptB}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 py-2">
                    <Button
                      variant={!isManualEdit ? "default" : "outline"}
                      onClick={() => setIsManualEdit(false)}
                      className={!isManualEdit ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Prompt
                    </Button>
                    <Button
                      variant={isManualEdit ? "default" : "outline"}
                      onClick={() => setIsManualEdit(true)}
                      className={isManualEdit ? "bg-yellow-500 hover:bg-yellow-600" : ""}
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
                        placeholder="E.g., Make this more concise, Add more humor, Focus on benefits..."
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
                      onClick={() => setEditingScript(null)}
                      disabled={isRefining}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApplyChanges}
                      disabled={isRefining || (!isManualEdit && !editInstruction.trim())}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
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

          {/* Empty State */}
          {!selectedIdea && !scriptData && (
            <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No Idea Selected
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Please go back to the ideas page and select an idea to generate scripts.
                </p>
                <Button
                  onClick={handleBackToIdeas}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-3 rounded-full border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Ideas
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MayraScript;