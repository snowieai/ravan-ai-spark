
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Video, Lightbulb, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleVideoRedirect = () => {
    window.open('https://kaira-video-forge.lovable.app', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-16 h-16 text-yellow-400 mr-4 animate-pulse" />
              <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-pink-200 bg-clip-text text-transparent">
                RavanAI
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
              World's First 
              <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent block">
                AI Video Generator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your ideas into stunning videos with AI. Start by generating an idea or bring your own script.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={() => navigate('/ideas')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center group"
            >
              <Lightbulb className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Generate Ideas
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={handleVideoRedirect}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center group"
            >
              <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Already Have a Script? Create Video
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">AI Ideas</h3>
              <p className="text-gray-300">Generate creative video ideas instantly with our AI-powered suggestion engine.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <Video className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Smart Scripts</h3>
              <p className="text-gray-300">Transform ideas into compelling scripts with multiple variations to choose from.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">AI Videos</h3>
              <p className="text-gray-300">Generate stunning videos from your scripts using cutting-edge AI technology.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
