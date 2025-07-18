
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Video, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const selectedScript = localStorage.getItem('selectedScript');
    if (selectedScript) {
      setScript(selectedScript);
      localStorage.removeItem('selectedScript');
    }
  }, []);

  const generateVideo = async () => {
    if (!script.trim()) {
      toast({
        title: "Missing Script",
        description: "Please provide a script for video generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowSuccess(false);
    
    try {
      const response = await fetch('https://ravanai.app.n8n.cloud/webhook-test/837c4cfe-e8c9-4243-9e02-2d2872b87417', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: script
        }),
      });

      const data = await response.json();
      
      setResult(data.output);
      setShowSuccess(true);
      toast({
        title: "Video Generation Started!",
        description: "Your AI video is being created. Please check back soon.",
      });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              AI Video Generator
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Transform your script into a stunning AI-generated video
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="script" className="text-gray-900 text-lg font-medium block mb-3">
                    Provide script for video generation
                  </Label>
                  <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Paste your video script here..."
                    className="min-h-48 bg-white/50 border-orange-200 text-gray-900 placeholder:text-gray-500 text-base resize-none"
                  />
                </div>
                <Button
                  onClick={generateVideo}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Generating Your Video...
                    </>
                  ) : (
                    <>
                      <Video className="w-6 h-6 mr-2" />
                      Generate AI Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showSuccess && result && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm border-green-200 animate-fade-in shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <CheckCircle className="w-16 h-16 text-green-500 animate-scale-in" />
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Video Generation Started!
                </h2>
                <div className="bg-white/60 rounded-lg p-6 mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {result}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Request Processed Successfully</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-500">
              <div className="w-32 h-32 mx-auto mb-6 opacity-50">
                <Video className="w-full h-full" />
              </div>
              <p className="text-xl">Enter your script above to generate an amazing AI video!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
