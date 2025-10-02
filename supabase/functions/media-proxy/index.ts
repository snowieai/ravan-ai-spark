const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Expose-Headers': 'content-length, content-range, accept-ranges',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

const inferContentType = (url: string): string | null => {
  const ext = url.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  };
  return types[ext || ''] || null;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mediaUrl = url.searchParams.get('url');

    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL is from allowed Supabase storage
    const allowedPattern = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/.+$/;
    if (!allowedPattern.test(mediaUrl)) {
      console.error('Invalid URL attempted:', mediaUrl);
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isAudio = mediaUrl.includes('.mp3') || mediaUrl.includes('.wav');
    console.log(`Proxying ${isAudio ? 'audio' : 'media'} request:`, mediaUrl);

    // Forward Range header for video/audio streaming
    const headers: HeadersInit = {};
    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
      console.log('Forwarding Range header:', rangeHeader);
    }

    // Handle HEAD requests (metadata only)
    if (req.method === 'HEAD') {
      const headResponse = await fetch(mediaUrl, { method: 'HEAD', headers });
      const responseHeaders = new Headers(corsHeaders);
      
      ['content-type', 'content-length', 'accept-ranges', 'last-modified', 'etag'].forEach(h => {
        const val = headResponse.headers.get(h);
        if (val) responseHeaders.set(h, val);
      });

      if (!responseHeaders.has('content-type')) {
        const inferred = inferContentType(mediaUrl);
        if (inferred) responseHeaders.set('content-type', inferred);
      }
      if (!responseHeaders.has('accept-ranges')) {
        responseHeaders.set('accept-ranges', 'bytes');
      }

      return new Response(null, {
        status: headResponse.status,
        headers: responseHeaders,
      });
    }

    // Fetch the media from external URL
    const response = await fetch(mediaUrl, { headers });

    if (!response.ok) {
      console.error('Failed to fetch media:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build response headers
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    
    // Pass through important headers
    const headersToForward = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
      'last-modified',
      'etag',
    ];

    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    // Fallbacks
    if (!responseHeaders.has('content-type')) {
      const inferred = inferContentType(mediaUrl);
      if (inferred) {
        responseHeaders.set('content-type', inferred);
        console.log('Inferred content-type:', inferred);
      }
    }
    if (!responseHeaders.has('accept-ranges')) {
      responseHeaders.set('accept-ranges', 'bytes');
    }

    console.log('Media proxy response:', {
      status: response.status,
      contentType: responseHeaders.get('content-type'),
      contentLength: responseHeaders.get('content-length'),
      hasRange: !!responseHeaders.get('content-range'),
      isAudio,
    });

    // Stream the response body
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Media proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
