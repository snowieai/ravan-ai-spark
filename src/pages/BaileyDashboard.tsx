import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, FileText, Video, ArrowRight, Home, LogOut, Activity, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BaileyDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const selectedInfluencer = localStorage.getItem('selectedInfluencer');
    
    if (!isLoggedIn || selectedInfluencer !== 'bailey') {
      navigate('/');
    }
  }, [navigate]);

  const handleNavigation = (path: string) => {
    navigate(path);
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

  const handleBackToInfluencers = () => {
    navigate('/influencers');
  };

  const tools = [
    {
      title: 'Generate Ideas',
      description: 'AI-powered content ideas for social media posts',
      icon: Lightbulb,
      path: '/bailey-ideas',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      status: 'Active'
    },
    {
      title: 'Script Writer', 
      description: 'Create engaging scripts for your videos',
      icon: FileText,
      path: '/bailey-script',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      status: 'Active'
    },
    {
      title: 'Video Creator',
      description: 'Generate professional videos with AI',
      icon: Video,
      path: '/video',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToInfluencers}
              variant="outline"
              className="flex items-center border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Influencers
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
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 w-full mx-auto shadow-lg border border-white/40 mb-8">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/lovable-uploads/a8037233-c2be-4b97-8739-3631486f9761.png" 
                alt="Bailey Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Bailey</h2>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Active
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Australia's Premier AI Real Estate Agent</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-gray-600">Active Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                  <p className="text-gray-600">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                  <Video className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-gray-600">Content Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Content Creation Tools
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Leverage Bailey's AI-powered tools to create engaging content for your real estate business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tools.map((tool) => (
            <Card 
              key={tool.title}
              className="bg-white/80 backdrop-blur-sm border-emerald-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 group relative overflow-hidden"
              onClick={() => tool.status === 'Active' ? handleNavigation(tool.path) : toast({
                title: "Coming Soon",
                description: `${tool.title} will be available soon.`,
              })}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>
              <CardHeader className="relative z-10">
                <div className={`w-16 h-16 ${tool.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                  <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 text-center">
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <p className="text-gray-600 mb-6">
                  {tool.description}
                </p>
                
                <Badge 
                  variant={tool.status === 'Active' ? 'default' : 'secondary'}
                  className={tool.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : ''}
                >
                  {tool.status}
                </Badge>
                
                {tool.status === 'Active' && (
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full border-0 flex items-center mx-auto mt-4 group-hover:translate-x-1 transition-transform"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaileyDashboard;