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
    const { contentId, script, influencerName } = await req.json();

    console.log('Triggering video generation for:', { contentId, influencerName });

    // Call the external Video SaaS API
    const videoSaasResponse = await fetch(
      'https://ojffuyzursflvqojuuql.supabase.co/functions/v1/generate-video-api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script,
          character: influencerName.charAt(0).toUpperCase() + influencerName.slice(1),
          content_id: contentId,
          callback_project_id: 'vkfmtrovrxgalhekzfsu',
        }),
      }
    );

    if (!videoSaasResponse.ok) {
      const errorText = await videoSaasResponse.text();
      console.error('Video SaaS error:', errorText);
      throw new Error(`Video SaaS error: ${errorText}`);
    }

    const result = await videoSaasResponse.json();
    console.log('Video generation response:', result);

    // Update content_calendar with job_id
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('content_calendar')
      .update({
        video_job_id: result.job_id,
        video_status: 'generating',
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Error updating content_calendar:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id: result.job_id,
        message: result.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in trigger-video-generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
