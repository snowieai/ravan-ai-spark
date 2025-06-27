
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
    // Pre-fill with selected script if coming from script page
    const selectedScript = localStorage.getItem('selectedScript');
    if (selectedScript) {
      setScript(selectedScript);
      localStorage.removeItem('selectedScript'); // Clean up
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
    console.log("Generating video for script:", script);
    
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
      console.log("Video webhook response:", data);
      
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
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-pink-400 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              AI Video Generator
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your script into a stunning AI-generated video
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="script" className="text-white text-lg font-medium block mb-3">
                    Provide script for video generation
                  </Label>
                  <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Paste your video script here..."
                    className="min-h-48 bg-white/5 border-white/20 text-white placeholder:text-gray-400 text-base resize-none"
                  />
                </div>
                <Button
                  onClick={generateVideo}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
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
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30 animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <CheckCircle className="w-16 h-16 text-green-400 animate-scale-in" />
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Video Generation Started!
                </h2>
                <div className="bg-black/20 rounded-lg p-6 mb-6">
                  <p className="text-gray-200 text-lg leading-relaxed">
                    {result}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Request Processed Successfully</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-400">
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
