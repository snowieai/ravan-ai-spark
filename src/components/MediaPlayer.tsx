import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

interface MediaPlayerProps {
  kind: "video" | "audio";
  src: string;
  className?: string;
  controls?: boolean;
  preload?: string;
  playsInline?: boolean;
}

export const MediaPlayer = ({
  kind,
  src,
  className = "",
  controls = true,
  preload = "metadata",
  playsInline = true,
}: MediaPlayerProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleLoadedMetadata = () => {
      setLoading(false);
      setError(false);
    };

    const handleError = () => {
      setError(true);
      setLoading(false);
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    media.addEventListener('loadstart', handleLoadStart);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('error', handleError);

    return () => {
      media.removeEventListener('loadstart', handleLoadStart);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('error', handleError);
    };
  }, [src]);

  const handleFullscreen = () => {
    if (kind === "video" && containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err);
        });
      }
    }
  };

  const handleVideoClick = () => {
    if (kind === "video") {
      handleFullscreen();
    }
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 bg-muted rounded-lg p-6 ${className}`}>
        <p className="text-sm text-muted-foreground">Failed to load {kind}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(src, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div ref={containerRef} className="relative group">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          controls={controls}
          preload={preload}
          playsInline={playsInline}
          onClick={handleVideoClick}
          className={`${className} cursor-pointer`}
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={handleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        src={src}
        controls={controls}
        preload={preload}
        className={className}
      />
    </div>
  );
};
