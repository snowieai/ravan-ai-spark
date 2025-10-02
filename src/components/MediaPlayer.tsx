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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Track fullscreen state (including iOS Safari events)
  useEffect(() => {
    const video = mediaRef.current as HTMLVideoElement | null;
    const onFullChange = () => setIsFullscreen(!!document.fullscreenElement);
    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);

    document.addEventListener('fullscreenchange', onFullChange);
    // @ts-ignore - iOS Safari specific events
    video?.addEventListener('webkitbeginfullscreen', onWebkitBegin as any);
    // @ts-ignore - iOS Safari specific events
    video?.addEventListener('webkitendfullscreen', onWebkitEnd as any);

    return () => {
      document.removeEventListener('fullscreenchange', onFullChange);
      // @ts-ignore - iOS Safari specific events
      video?.removeEventListener('webkitbeginfullscreen', onWebkitBegin as any);
      // @ts-ignore - iOS Safari specific events
      video?.removeEventListener('webkitendfullscreen', onWebkitEnd as any);
    };
  }, []);

  const handleFullscreen = () => {
    if (kind !== 'video') return;
    const video = mediaRef.current as HTMLVideoElement | null;
    const container = containerRef.current;

    const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement;

    try {
      if (isFs) {
        if (document.exitFullscreen) document.exitFullscreen();
        // @ts-ignore - WebKit fallback
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      } else {
        if (video?.requestFullscreen) {
          video.requestFullscreen();
          // @ts-ignore - iOS Safari native video fullscreen
        } else if ((video as any)?.webkitEnterFullscreen) {
          // @ts-ignore
          (video as any).webkitEnterFullscreen();
        } else if (container?.requestFullscreen) {
          container.requestFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
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
          className={className}
        />
        <Button
          size="icon"
          variant="secondary"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className={`absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm shadow-lg rounded-md bg-black/60 hover:bg-black/80 border-none ${isFullscreen ? 'hidden' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleFullscreen();
          }}
        >
          <Maximize2 className="h-5 w-5 text-white" />
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
