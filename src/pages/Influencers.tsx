import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ArrowRight, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Influencers = () => {
  const navigate = useNavigate();

  const influencers = [
    {
      id: 'kaira',
      name: 'Kaira',
      status: 'Active',
      description: 'UAE\'s First AI Real Estate Agent',
      color: 'from-orange-500 to-amber-500',
      image: '/lovable-uploads/27be5644-7569-4e58-9fa0-9631b580b5fe.png'
    },
    {
      id: 'aisha',
      name: 'Aisha',
      status: 'Active', 
      description: 'India\'s First AI Real Estate Agent',
      color: 'from-blue-500 to-purple-500',
      image: '/lovable-uploads/3e0d7295-7862-4944-8077-740843b828a2.png'
    }
  ];

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const handleInfluencerClick = (influencerId: string) => {
    if (influencerId === 'kaira') {
      localStorage.setItem('selectedInfluencer', 'kaira');
      navigate('/kaira-dashboard');
    } else if (influencerId === 'aisha') {
      localStorage.setItem('selectedInfluencer', 'aisha');
      navigate('/aisha-dashboard');
    } else {
      toast({
        title: "Coming Soon",
        description: `${influencerId} dashboard will be available soon.`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="relative z-20 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/c994a09f-d72a-4d41-9517-57b6af00219b.png" 
                alt="Ravan.ai Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-amber-300/25 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Client Branding Section */}
        <div className="text-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 w-full mx-auto shadow-lg border border-white/40 mb-8">
            <div className="flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/e83030ec-55fb-417b-b36b-1c495b550304.png" 
                alt="Danube Properties Logo" 
                className="h-24 w-full object-contain filter drop-shadow-lg max-w-md mx-auto opacity-90"
              />
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium text-sm">Powered by AI Excellence</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-500 p-3 rounded-2xl mr-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Active Influencers
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Manage your AI influencers and access their content creation tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {influencers.map((influencer) => (
            <Card 
              key={influencer.id}
              className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 group relative overflow-hidden"
              onClick={() => handleInfluencerClick(influencer.id)}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${influencer.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                style={{
                  boxShadow: `inset 0 0 50px ${influencer.id === 'kaira' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  animation: `pulse 2s ease-in-out infinite alternate`
                }}
              ></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center">
                  {/* Profile Image */}
                  <div className="w-full aspect-square mx-auto mb-6 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={influencer.image} 
                      alt={`${influencer.name} Profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {influencer.name}
                  </h3>
                  
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {influencer.status}
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {influencer.description}
                  </p>
                  
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full border-0 flex items-center mx-auto group-hover:translate-x-1 transition-transform"
                  >
                    Access Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {influencers.length === 0 && (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-6 opacity-50">
              <Users className="w-full h-full" />
            </div>
            <p className="text-xl">No active influencers found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Influencers;