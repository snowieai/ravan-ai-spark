
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook-test/3205b796-624b-450a-b2e5-54dec2d3a73e', {
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
    localStorage.setItem('selectedScript', scriptContent);
    navigate('/video');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-32 right-1/4 w-8 h-8 text-orange-400/40" />
        <Sparkles className="absolute bottom-1/3 left-1/4 w-6 h-6 text-amber-400/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-500 p-3 rounded-2xl mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              AI Script Generator
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Transform your ideas into compelling video scripts with multiple variations
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="text-gray-900 text-lg font-medium">
                    Provide a topic or idea to generate a script
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your video topic or idea..."
                    className="mt-2 bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500 text-lg p-4"
                  />
                </div>
                <Button
                  onClick={generateScript}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
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
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {scriptData.title}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {scriptData.scripts?.map((script, index) => (
                <Card 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-xl transition-all duration-300 h-full"
                >
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-xl flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-orange-500" />
                      {script.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col h-full">
                    <div className="bg-gray-50/80 rounded-lg p-4 mb-4 flex-grow overflow-y-auto max-h-80">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {script.content}
                      </p>
                    </div>
                    <Button
                      onClick={() => selectScript(script.content)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 mt-auto rounded-full"
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
