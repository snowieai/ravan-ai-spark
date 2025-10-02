import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    console.log('Webhook received:', { jobId, method: req.method });
    
    if (!jobId) {
      throw new Error('Missing jobId parameter');
    }

    const body = await req.json();
    console.log('Video generation results received:', { 
      jobId, 
      hasImages: !!body.broll_images,
      hasVideos: !!body.broll_videos,
      hasLipsync: !!body.lipsync_videos
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find content by job_id
    const { data: content, error: contentError } = await supabase
      .from('content_calendar')
      .select('id')
      .eq('video_job_id', jobId)
      .single();

    if (contentError || !content) {
      console.error('Content not found:', { jobId, error: contentError });
      throw new Error(`No content found for jobId: ${jobId}`);
    }

    console.log('Found content:', content.id);

    // Update or create video generation results (upsert)
    const { error: upsertError } = await supabase
      .from('video_generations')
      .upsert({
        content_id: content.id,
        job_id: jobId,
        status: 'completed',
        broll_images: body.broll_images || [],
        broll_videos: body.broll_videos || [],
        lipsync_images: body.lipsync_images || [],
        lipsync_videos: body.lipsync_videos || [],
        full_audio: body.full_audio || null,
      }, {
        onConflict: 'job_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting video generation:', upsertError);
      throw upsertError;
    }

    // Update content_calendar status
    const { error: updateError } = await supabase
      .from('content_calendar')
      .update({ video_status: 'completed' })
      .eq('id', content.id);

    if (updateError) {
      console.error('Error updating content status:', updateError);
      throw updateError;
    }

    console.log('Video generation results saved successfully for jobId:', jobId);

    return new Response(
      JSON.stringify({ success: true, message: 'Video generation results saved', content_id: content.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in webhook-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
