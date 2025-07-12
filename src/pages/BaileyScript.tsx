import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowLeft, LogOut, Send, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BaileyScript = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (!isLoggedIn || selectedInfluencer !== 'bailey') {
      navigate('/');
    }
  }, [navigate]);

  const generateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your script.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook/a1deb79b-ccda-4db4-8b80-f0d595d4e0b1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Generate Script',
          topic: topic,
          description: description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      
      if (data && data.script) {
        setScript(data.script);
      } else if (data && typeof data === 'string') {
        setScript(data);
      } else {
        throw new Error('Invalid script response');
      }
      
      toast({
        title: "Script Generated!",
        description: "Your video script has been created successfully.",
      });
      
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
      
      // Fallback script
      setScript(`**Bailey's Real Estate Video Script: ${topic}**

[INTRO]
Hey there! Bailey here, your trusted AI real estate agent in Australia. 

[MAIN CONTENT]
${description ? `Today I want to talk to you about ${description.toLowerCase()}.` : `Let me share some insights about ${topic}.`}

This is exactly what you need to know as a property buyer or seller in today's Australian market.

[KEY POINTS]
• Market insights and trends
• Professional guidance you can trust
• Tailored solutions for your needs

[CALL TO ACTION]
Ready to make your next property move? Let's connect and discuss how I can help you achieve your real estate goals.

[OUTRO]
Thanks for watching! Don't forget to follow for more real estate tips and market updates from your AI agent, Bailey.`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Script copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedInfluencer');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/bailey-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              Script Writer
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Create engaging video scripts with Bailey's AI-powered writing assistance
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="w-6 h-6 text-emerald-600 mr-2" />
                Script Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Luxury Waterfront Properties in Sydney"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Description (Optional)
                </label>
                <Textarea
                  placeholder="Provide more context about what you want to cover in the script..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500 min-h-[100px]"
                />
              </div>

              <Button
                onClick={generateScript}
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-lg font-semibold border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Generating Script...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Generate Script
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-emerald-600 mr-2" />
                  Generated Script
                </div>
                {script && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {script ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-emerald-100">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
                    {script}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your generated script will appear here</p>
                  <p className="text-sm mt-2">Enter a topic and click "Generate Script" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BaileyScript;