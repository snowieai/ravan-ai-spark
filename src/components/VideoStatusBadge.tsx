import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface VideoStatusProps {
  videoStatus?: string | null;
  videoUrl?: string | null;
  compact?: boolean;
}

export function VideoStatusBadge({ videoStatus, videoUrl, compact = false }: VideoStatusProps) {
  if (!videoStatus) return null;

  if (compact) {
    return (
      <>
        {videoStatus === 'completed' && (
          <Badge className="text-xs px-1 py-0 bg-green-100 text-green-800">
            ✅ Video Ready
          </Badge>
        )}
        {videoStatus === 'generating' && (
          <Badge className="text-xs px-1 py-0 bg-blue-100 text-blue-800 animate-pulse">
            🎬 Generating...
          </Badge>
        )}
        {videoStatus === 'failed' && (
          <Badge className="text-xs px-1 py-0 bg-red-100 text-red-800">
            ❌ Failed
          </Badge>
        )}
      </>
    );
  }

  return (
    <div className="border-t pt-4">
      <label className="text-sm font-semibold text-gray-700">Video Generation</label>
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          {videoStatus === 'completed' && (
            <Badge className="bg-green-100 text-green-800">✅ Video Ready</Badge>
          )}
          {videoStatus === 'generating' && (
            <Badge className="bg-blue-100 text-blue-800 animate-pulse">🎬 Generating...</Badge>
          )}
          {videoStatus === 'failed' && (
            <Badge className="bg-red-100 text-red-800">❌ Generation Failed</Badge>
          )}
        </div>
        {videoStatus === 'completed' && videoUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(videoUrl, '_blank')}
            className="w-full"
          >
            <Video className="h-4 w-4 mr-2" />
            View Generated Video
          </Button>
        )}
      </div>
    </div>
  );
}
