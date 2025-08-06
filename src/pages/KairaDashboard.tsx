import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, ArrowLeft, User, Calendar } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';

const KairaDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                onClick={() => navigate('/influencers')}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
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
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-700 font-medium">Kaira</span>
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
          {/* Welcome Message */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Kaira's Studio
              </span>
            </h1>
            
            {/* Kaira Image with Simple Glow */}
            <div className="mb-8">
              <div className="relative w-96 h-96 mx-auto">
                {/* Simple glow effect behind the image */}
                <div className="absolute inset-0 bg-orange-400/30 rounded-2xl blur-xl"></div>
                {/* Plain image container */}
                <div className="relative rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                  <img 
                    src="/lovable-uploads/9c231dbd-f179-4bb6-af40-8bd0521105e8.png" 
                    alt="Kaira - AI Video Generation Specialist" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
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
          <div className="flex justify-center items-center gap-6 mb-20">
            <Button
              onClick={() => navigate('/kaira-ideas')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Lightbulb className="w-7 h-7 mr-3 group-hover:animate-pulse" />
              Generate Ideas
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => navigate('/kaira-calendar-themes')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <Calendar className="w-7 h-7 mr-3 group-hover:animate-pulse" />
              Content Calendar Theme
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KairaDashboard;