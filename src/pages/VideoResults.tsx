import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Video, Image, Music, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MediaPlayer } from "@/components/MediaPlayer";

interface VideoGeneration {
  id: string;
  job_id: string;
  status: string;
  broll_images: string[];
  broll_videos: string[];
  lipsync_images: string[];
  lipsync_videos: string[];
  full_audio: string | null;
  created_at: string;
}

const VideoResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contentId = searchParams.get("content_id");
  
  const [generation, setGeneration] = useState<VideoGeneration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) {
      toast({
        title: "Error",
        description: "No content ID provided",
        variant: "destructive",
      });
      navigate("/approvals");
      return;
    }

    loadVideoResults();
    
    // Poll for updates every 10 seconds if still processing
    const interval = setInterval(() => {
      if (generation?.status === 'processing') {
        loadVideoResults();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [contentId]);

  const loadVideoResults = async () => {
    try {
      const { data, error } = await supabase
        .from("video_generations")
        .select("*")
        .eq("content_id", contentId)
        .single();

      if (error) throw error;
      
      setGeneration(data);
    } catch (error) {
      console.error("Error loading video results:", error);
      toast({
        title: "Error",
        description: "Failed to load video results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading video results...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No video generation found</p>
            <Button onClick={() => navigate("/approvals")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generation.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Video Generation in Progress</h3>
            <p className="text-muted-foreground mb-4">
              Your video is being generated. This page will update automatically when ready.
            </p>
            <Button variant="outline" onClick={() => navigate("/approvals")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/video-library")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Video Generation Results</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Job ID: {generation.job_id}</p>
        </div>

        {/* Lipsync Videos */}
        {generation.lipsync_videos && generation.lipsync_videos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Lipsync Videos ({generation.lipsync_videos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generation.lipsync_videos.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-[9/16] w-full">
                      <MediaPlayer
                        kind="video"
                        src={url}
                        className="w-full h-full rounded-lg border border-border object-cover"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => downloadAsset(url, `lipsync-video-${index + 1}.mp4`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* B-Roll Videos */}
        {generation.broll_videos && generation.broll_videos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                B-Roll Videos ({generation.broll_videos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generation.broll_videos.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video w-full">
                      <MediaPlayer
                        kind="video"
                        src={url}
                        className="w-full h-full rounded-lg border border-border object-cover"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => downloadAsset(url, `broll-video-${index + 1}.mp4`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lipsync Images */}
        {generation.lipsync_images && generation.lipsync_images.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Lipsync Images ({generation.lipsync_images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generation.lipsync_images.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <img 
                      src={url} 
                      alt={`Lipsync ${index + 1}`}
                      className="w-full rounded-lg border border-border aspect-square object-cover"
                      loading="lazy"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => downloadAsset(url, `lipsync-image-${index + 1}.png`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Full Audio */}
        {generation.full_audio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Full Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MediaPlayer
                  kind="audio"
                  src={generation.full_audio}
                  className="w-full"
                />
                <Button 
                  variant="outline"
                  onClick={() => downloadAsset(generation.full_audio!, 'full-audio.mp3')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoResults;
