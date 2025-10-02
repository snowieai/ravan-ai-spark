import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Film, Search, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { proxiedUrl } from "@/lib/media";
import { MediaPlayer } from "@/components/MediaPlayer";

interface VideoGeneration {
  id: string;
  content_id: string;
  job_id: string;
  status: string;
  created_at: string;
  lipsync_images: string[];
  lipsync_videos: string[];
  broll_images: string[];
  broll_videos: string[];
  full_audio: string | null;
  content_calendar: {
    topic: string;
    influencer_name: string;
    script_content: string;
    scheduled_date: string;
  };
}

export default function VideoLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchVideos();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchVideos();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchVideos = async () => {
    try {
      // Fetch video_generations with content_calendar data
      const { data: videoGens, error: videoError } = await supabase
        .from("video_generations")
        .select(`
          *,
          content_calendar (
            topic,
            influencer_name,
            script_content,
            scheduled_date
          )
        `)
        .order("created_at", { ascending: false });

      if (videoError) throw videoError;

      // Also fetch content_calendar items with video_status but no video_generations record
      // This handles legacy videos generated before the new system
      const { data: legacyVideos, error: legacyError } = await supabase
        .from("content_calendar")
        .select("*")
        .not("video_status", "is", null)
        .not("video_job_id", "is", null);

      if (legacyError) throw legacyError;

      // Combine both, but exclude legacy videos that already have video_generations records
      const existingJobIds = new Set((videoGens || []).map(v => v.job_id));
      const legacyItems = (legacyVideos || [])
        .filter(lv => !existingJobIds.has(lv.video_job_id))
        .map(lv => ({
          id: lv.id,
          content_id: lv.id,
          job_id: lv.video_job_id,
          status: lv.video_status === 'generating' ? 'processing' : lv.video_status,
          created_at: lv.created_at,
          lipsync_images: [],
          lipsync_videos: [],
          broll_images: [],
          broll_videos: [],
          full_audio: null,
          content_calendar: {
            topic: lv.topic,
            influencer_name: lv.influencer_name,
            script_content: lv.script_content || '',
            scheduled_date: lv.scheduled_date,
          }
        }));

      setVideos([...(videoGens || []), ...legacyItems]);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load video library");
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.content_calendar.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.content_calendar.script_content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCharacter = characterFilter === "all" || 
                            video.content_calendar.influencer_name.toLowerCase() === characterFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    
    return matchesSearch && matchesCharacter && matchesStatus;
  });

  const stats = {
    total: videos.length,
    processing: videos.filter((v) => v.status === "processing").length,
    completed: videos.filter((v) => v.status === "completed").length,
    failed: videos.filter((v) => v.status === "failed").length,
  };

  const getCharacterColor = (name: string) => {
    const colors: Record<string, string> = {
      kaira: "from-orange-500 to-amber-500",
      aisha: "from-blue-500 to-cyan-500",
      bailey: "from-purple-500 to-pink-500",
      mayra: "from-green-500 to-emerald-500",
    };
    return colors[name.toLowerCase()] || "from-gray-500 to-gray-600";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      processing: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        label: "Processing",
        icon: <Loader2 className="h-3 w-3 animate-spin" />
      },
      completed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        label: "Completed",
        icon: <Film className="h-3 w-3" />
      },
      failed: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        label: "Failed",
        icon: null
      },
    };
    
    const style = styles[status] || styles.processing;
    return (
      <Badge className={`${style.color} flex items-center gap-1`}>
        {style.icon}
        {style.label}
      </Badge>
    );
  };

  const downloadAsset = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/approvals")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Film className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Video Library</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Videos</div>
          </Card>
          <Card className="p-6 text-center border-yellow-500/50">
            <div className="text-3xl font-bold text-yellow-600">{stats.processing}</div>
            <div className="text-sm text-muted-foreground mt-1">Processing</div>
          </Card>
          <Card className="p-6 text-center border-green-500/50">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground mt-1">Completed</div>
          </Card>
          <Card className="p-6 text-center border-red-500/50">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground mt-1">Failed</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by topic or script content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={characterFilter} onValueChange={setCharacterFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Character" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Characters</SelectItem>
              <SelectItem value="kaira">Kaira</SelectItem>
              <SelectItem value="aisha">Aisha</SelectItem>
              <SelectItem value="bailey">Bailey</SelectItem>
              <SelectItem value="mayra">Mayra</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Loading video library...
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">No videos found</p>
            <p className="text-muted-foreground">
              {searchQuery || characterFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Generate your first video to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Character Avatar Header */}
                <div className={`h-2 bg-gradient-to-r ${getCharacterColor(video.content_calendar.influencer_name)}`} />
                
                <div className="p-4">
                  {/* Character Name & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getCharacterColor(video.content_calendar.influencer_name)} flex items-center justify-center text-white font-bold`}>
                        {video.content_calendar.influencer_name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {video.content_calendar.influencer_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>

                  {/* Thumbnail Preview - 9:16 aspect ratio (180x320) */}
                  {video.lipsync_images && video.lipsync_images.length > 0 ? (
                    <div className="mb-3 rounded-lg overflow-hidden bg-muted aspect-[9/16]">
                      <img
                        src={proxiedUrl(video.lipsync_images[0])}
                        alt="Video thumbnail"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg overflow-hidden bg-muted aspect-[9/16] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Job ID & Topic */}
                  <div className="mb-3">
                    <div className="text-xs font-mono text-primary mb-1">
                      {video.job_id}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.content_calendar.topic}
                    </p>
                  </div>

                  {/* Asset Count */}
                  <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                    {video.lipsync_videos && video.lipsync_videos.length > 0 && (
                      <span>🎬 {video.lipsync_videos.length} Videos</span>
                    )}
                    {video.lipsync_images && video.lipsync_images.length > 0 && (
                      <span>🖼️ {video.lipsync_images.length} Images</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/video-results?content_id=${video.content_id}`)}
                      disabled={video.status === "processing"}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {video.status === "completed" && video.lipsync_videos && video.lipsync_videos.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAsset(proxiedUrl(video.lipsync_videos[0]), `${video.content_calendar.influencer_name}-video.mp4`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
