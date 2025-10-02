import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface MediaPlayerProps {
  kind: "video" | "audio";
  src: string;
  className?: string;
  controls?: boolean;
  preload?: string;
  playsInline?: boolean;
  crossOrigin?: "" | "anonymous" | "use-credentials";
}

export const MediaPlayer = ({
  kind,
  src,
  className = "",
  controls = true,
  preload = "metadata",
  playsInline = true,
  crossOrigin = "anonymous",
}: MediaPlayerProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    let metadataTimeout: number;
    let hasLoadedMetadata = false;

    const handleLoadStart = () => {
      console.log(`[MediaPlayer] ${kind} loadstart:`, src);
      setLoading(true);
    };

    const handleLoadedMetadata = () => {
      console.log(`[MediaPlayer] ${kind} metadata loaded:`, src);
      hasLoadedMetadata = true;
      setLoading(false);
      setError(false);
      clearTimeout(metadataTimeout);
    };

    const handleError = async (e: Event) => {
      console.error(`[MediaPlayer] ${kind} error:`, src, e);
      
      // If we haven't tried blob fallback yet
      if (!blobUrl) {
        console.log(`[MediaPlayer] Attempting blob fallback for:`, src);
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error('Fetch failed');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
          console.log(`[MediaPlayer] Blob URL created successfully`);
          return;
        } catch (fetchError) {
          console.error(`[MediaPlayer] Blob fallback failed:`, fetchError);
        }
      }
      
      setError(true);
      setLoading(false);
    };

    // Set timeout to trigger blob fallback if metadata doesn't load
    metadataTimeout = window.setTimeout(() => {
      if (!hasLoadedMetadata && !error && !blobUrl) {
        console.warn(`[MediaPlayer] Metadata timeout, trying blob fallback:`, src);
        handleError(new Event('timeout'));
      }
    }, 3000);

    media.addEventListener('loadstart', handleLoadStart);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('error', handleError);

    return () => {
      media.removeEventListener('loadstart', handleLoadStart);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('error', handleError);
      clearTimeout(metadataTimeout);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src, kind, error, blobUrl]);

  const currentSrc = blobUrl || src;

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
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={currentSrc}
          controls={controls}
          preload={preload}
          playsInline={playsInline}
          crossOrigin={crossOrigin}
          className={className}
        />
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
        src={currentSrc}
        controls={controls}
        preload={preload}
        crossOrigin={crossOrigin}
        className={className}
      />
    </div>
  );
};
