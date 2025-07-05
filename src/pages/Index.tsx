
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';
import AnimatedText from '@/components/AnimatedText';

const Index = () => {
  const navigate = useNavigate();

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
        <div className="text-center max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Ravan AI
              </span>
            </h1>
            
            {/* Animated tagline */}
            <div className="mb-8">
              <AnimatedText />
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-3xl mx-auto shadow-lg border border-orange-100">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Your AI-powered influencer management platform.
                <br />
                <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-semibold">
                  Manage your influencers and create stunning content with AI.
                </span>
              </p>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Button
              onClick={() => navigate('/login')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <LogIn className="w-7 h-7 mr-3" />
              Login
            </Button>
            
            <Button
              onClick={() => navigate('/login')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-12 py-6 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center group border-0"
            >
              <UserPlus className="w-7 h-7 mr-3" />
              Sign Up
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-20 text-gray-500 text-sm">
            © 2025 Ravan AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
