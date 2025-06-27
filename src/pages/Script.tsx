
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-fill with selected idea if coming from ideas page
    const selectedIdea = localStorage.getItem('selectedIdea');
    if (selectedIdea) {
      setTopic(selectedIdea);
      localStorage.removeItem('selectedIdea'); // Clean up
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
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook-test/837c4cfe-e8c9-4243-9e02-2d2872b87417', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic
        }),
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

  const selectScript = (scriptContent: string) => {
    console.log("Selected script:", scriptContent);
    // Store the selected script and navigate to video page
    localStorage.setItem('selectedScript', scriptContent);
    navigate('/video');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-green-400 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              AI Script Generator
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your ideas into compelling video scripts with multiple variations
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="text-white text-lg font-medium">
                    Provide a topic or idea to generate a script
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your video topic or idea..."
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-gray-400 text-lg p-4"
                  />
                </div>
                <Button
                  onClick={generateScript}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Generating Scripts...
                    </>
                  ) : (
                    <>
                      <FileText className="w-6 h-6 mr-2" />
                      Generate Scripts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {scriptData && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              {scriptData.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scriptData.scripts?.map((script, index) => (
                <Card 
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-green-400" />
                      {script.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="bg-black/20 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {script.content}
                      </p>
                    </div>
                    <Button
                      onClick={() => selectScript(script.content)}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0"
                    >
                      Use this script to generate video
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!scriptData && !isLoading && (
          <div className="text-center text-gray-400">
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
