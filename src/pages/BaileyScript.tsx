import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, FileText, Download, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    const idea = localStorage.getItem('selectedIdea');
    
    if (!isLoggedIn || selectedInfluencer !== 'bailey') {
      navigate('/');
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
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1?message=${encodeURIComponent(idea)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      
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

  const handleDownload = (scriptContent: string, scriptLabel: string) => {
    const element = document.createElement('a');
    const file = new Blob([scriptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `bailey_${scriptLabel.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Script has been downloaded successfully.",
    });
  };

  const selectScript = () => {
    toast({
      title: "Coming Soon! 🎬",
      description: "Video generation with Bailey will be available soon for you. Stay tuned!",
    });
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
                  className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-xl transition-all duration-300 h-full"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900 text-xl flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-emerald-500 flex-shrink-0" />
                      <span className="line-clamp-2">{script.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col h-full">
                    <div className="bg-gray-50/80 rounded-lg p-4 mb-4 flex-grow overflow-y-auto max-h-80">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                        {script.content}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        onClick={() => handleDownload(script.content, script.label)}
                        variant="outline"
                        className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={selectScript}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                      >
                        Use Script
                        <ArrowRight className="w-4 h-4 ml-2" />
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
      </div>
    </div>
  );
};

export default BaileyScript;