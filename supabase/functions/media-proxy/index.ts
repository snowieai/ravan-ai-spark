const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Expose-Headers': 'content-length, content-range, accept-ranges',
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

    console.log('Proxying media request:', mediaUrl);

    // Forward Range header for video streaming
    const headers: HeadersInit = {};
    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
      console.log('Forwarding Range header:', rangeHeader);
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

    console.log('Media proxy response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      hasRange: !!response.headers.get('content-range'),
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
