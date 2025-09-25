import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Lightbulb, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';

const AishaDashboard = () => {
  const navigate = useNavigate();

  // Auth check now handled by ProtectedRoute

  const handleScriptRedirect = () => {
    // Unresponsive for now - will add link later
    console.log('Script generation will be available soon');
  };

  const handleIdeasRedirect = () => {
    navigate('/ideas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                onClick={() => navigate('/influencers')}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Influencers
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
                alt="Ravan.ai Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1 flex items-center justify-end">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 mr-3">
                  <img 
                    src="/lovable-uploads/798609c5-a21a-445a-a991-92bf921ae7bd.png" 
                    alt="Aisha" 
                    className="w-full h-full object-cover"
                />
              </div>
              <span className="text-gray-700 font-medium">Aisha</span>
            </div>
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
          particleColor="#3b82f6"
          speed={1}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-purple-300/25 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-36 h-36 bg-blue-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Aisha's Studio
              </span>
            </h1>
            
            {/* Aisha Image with Simple Glow */}
            <div className="mb-8">
              <div className="relative w-96 h-96 mx-auto">
                {/* Simple glow effect behind the image */}
                <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-xl"></div>
                {/* Plain image container */}
                <div className="relative rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                    <img 
                      src="/lovable-uploads/798609c5-a21a-445a-a991-92bf921ae7bd.png" 
                      alt="Aisha - AI Video Generation Specialist" 
                      className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto shadow-lg border border-blue-100">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Meet <span className="text-blue-500 font-semibold">Aisha</span>, your AI video generation assistant powered by <span className="text-blue-500 font-semibold">Ravan AI</span>.
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
              onClick={handleIdeasRedirect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Lightbulb className="w-7 h-7 mr-3 group-hover:animate-pulse" />
              Generate Ideas
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={handleScriptRedirect}
              className="bg-gray-800 hover:bg-gray-900 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Video className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
              Generate Script with Custom Idea
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AishaDashboard;