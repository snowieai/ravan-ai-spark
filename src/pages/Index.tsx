
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Lightbulb, ArrowRight, Zap, Brain, Diamond } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';
import AnimatedText from '@/components/AnimatedText';

const Index = () => {
  const navigate = useNavigate();

  const handleVideoRedirect = () => {
    window.open('https://kaira-video-forge.lovable.app', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Header/Navigation Section */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
              alt="Ravan.ai Logo" 
              className="h-16 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={2}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#ff8c00"
          speed={1}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-36 h-36 bg-orange-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="mb-16">
            <AnimatedText />
            
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto shadow-lg border border-orange-100">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Meet <span className="text-orange-500 font-semibold">Kaira</span>, your AI video generation assistant powered by <span className="text-orange-500 font-semibold">Ravan AI</span>.
                <br />
                <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-semibold">
                  Transform your creative vision into stunning, professional-quality videos in minutes.
                </span>
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
            <Button
              onClick={() => navigate('/ideas')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Lightbulb className="w-7 h-7 mr-3 group-hover:animate-pulse" />
              Generate Ideas
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={handleVideoRedirect}
              className="bg-gray-800 hover:bg-gray-900 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Video className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
              Create AI Video with Kaira
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-blue-500 p-4 rounded-2xl w-fit mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Generate professional videos in minutes, not hours. Kaira works at the speed of thought.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-orange-500 p-4 rounded-2xl w-fit mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Advanced AI understands your content and creates engaging visuals that captivate your audience.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-amber-500 p-4 rounded-2xl w-fit mx-auto mb-6">
                <Diamond className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Studio Quality</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Professional-grade output ready for any platform, from social media to presentations.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 text-gray-500 text-sm">
            © 2024 Ravan AI. One AI to Sell them ALL.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
