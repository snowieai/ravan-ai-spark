import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, Sparkles, ArrowLeft, Edit3, Check, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Script {
  label: string;
  content: string;
}

interface ScriptResponse {
  title: string;
  scripts: Script[];
}

const KairaScript = () => {
  const [topic, setTopic] = useState('');
  const [scriptData, setScriptData] = useState<ScriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScriptIndex, setEditingScriptIndex] = useState<number | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [manualEditContent, setManualEditContent] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedIdea = localStorage.getItem('selectedIdea');
    if (selectedIdea) {
      setTopic(selectedIdea);
      localStorage.removeItem('selectedIdea');
    }
  }, []);

  const generateScript = async () => {
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
      const response = await fetch(`https://n8n.srv905291.hstgr.cloud/webhook/3205b796-624b-450a-b2e5-54dec2d3a73e?message=${encodeURIComponent(topic)}`, {
        method: 'GET',
      });

      const data = await response.json();
      console.log("Kaira script webhook response:", data);
      
      if (data.output && typeof data.output === 'object') {
        setScriptData(data.output);
        toast({
          title: "Scripts Generated!",
          description: `Kaira created ${data.output.scripts?.length || 0} script variations for you.`,
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

    try {
      const { error } = await supabase
        .from('content_calendar')
        .insert({
          topic: topic,
          script_content: selectedScript.content,
          scheduled_date: new Date().toISOString().split('T')[0],
          status: 'script_ready',
          priority: 2,
          content_source: 'generated',
          category: 'Entertainment'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Script saved to content calendar",
      });

      navigate('/kaira-calendar');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/kaira-dashboard')}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Kaira's Studio</span>
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
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-orange-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-amber-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="bg-orange-500 p-2 sm:p-3 rounded-2xl mb-3 sm:mb-0 sm:mr-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 text-center">
              Kaira's Script Generator
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your ideas into compelling video scripts with Kaira's AI assistance
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg mx-4 sm:mx-0">
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
                    className="mt-2 bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500 text-base sm:text-lg p-3 sm:p-4"
                  />
                </div>
                <Button
                  onClick={generateScript}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                      Kaira is generating scripts...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Generate Scripts with Kaira
                    </>
                  )}
                </Button>
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
                  className={`bg-white/80 backdrop-blur-sm border-orange-100 transition-all duration-300 h-full cursor-pointer hover:scale-105 hover:shadow-2xl ${
                    selectedScript?.label === script.label ? 'ring-2 ring-orange-500 border-orange-300' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900 text-lg sm:text-xl flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-orange-500 flex-shrink-0" />
                        <span className="line-clamp-2">{script.label}</span>
                      </div>
                      {selectedScript?.label === script.label && (
                        <Badge className="bg-orange-500 text-white ml-2 flex-shrink-0">Selected</Badge>
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
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-full py-3 px-4 text-sm sm:text-base font-medium"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Use This
                      </Button>
                      <Button
                        onClick={() => handleEditThis(script, index)}
                        variant="outline"
                        className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full py-3 px-4 text-sm sm:text-base font-medium"
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
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-orange-100">
              <p className="text-gray-700 text-lg mb-6">
                Script Selected! Click below to save and proceed.
              </p>
              <Button
                onClick={handleSaveAndContinue}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-16 py-7 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0 hover:scale-105"
              >
                <Check className="w-7 h-7 mr-3" />
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editingScriptIndex !== null} onOpenChange={() => setEditingScriptIndex(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-orange-600">Edit Script</DialogTitle>
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
                    className={!isManualEdit ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Prompt
                  </Button>
                  <Button
                    variant={isManualEdit ? "default" : "outline"}
                    onClick={() => setIsManualEdit(true)}
                    className={isManualEdit ? "bg-orange-500 hover:bg-orange-600" : ""}
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
                    className="bg-orange-500 hover:bg-orange-600 text-white"
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
            <p className="text-xl">Enter your topic above to generate compelling scripts with Kaira!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KairaScript;