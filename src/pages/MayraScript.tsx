import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Home, LogOut, Loader2, ArrowLeft, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ScriptData {
  scriptA: string;
  scriptB: string;
  title?: string;
}

const MayraScript = () => {
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    const idea = localStorage.getItem('selectedIdea');
    
    if (!isLoggedIn || selectedInfluencer !== 'mayra') {
      navigate('/');
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
      
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Generate Script&idea=${encodeURIComponent(idea)}`, {
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
      
      const response = await fetch(`https://ravanai.app.n8n.cloud/webhook/31fda247-1f1b-48ac-8d53-50e26cb92728?message=Generate Script&idea=${encodeURIComponent(selectedIdea)}`, {
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

  const downloadScript = (script: string, version: string) => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mayra-script-${version.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `Script ${version} has been downloaded.`,
    });
  };

  const copyToClipboard = (script: string, version: string) => {
    navigator.clipboard.writeText(script).then(() => {
      toast({
        title: "Copied!",
        description: `Script ${version} copied to clipboard.`,
      });
    });
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Script A */}
              <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Script A
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Version A
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {scriptData.scriptA}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadScript(scriptData.scriptA, 'A')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(scriptData.scriptA, 'A')}
                      variant="outline"
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Script B */}
              <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Script B
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Version B
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {scriptData.scriptB}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadScript(scriptData.scriptB, 'B')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(scriptData.scriptB, 'B')}
                      variant="outline"
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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