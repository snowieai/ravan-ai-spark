import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, character, script } = await req.json();

    if (!jobId || !character || !script) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jobId, character, script" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build webhook URL with query parameters
    const webhookUrl = "https://vkfmtrovrxgalhekzfsu.supabase.co/functions/v1/webhook-handler";
    const n8nUrl = new URL("https://n8n.srv905291.hstgr.cloud/webhook/c200f67b-9361-4017-afc1-a7e525b36f3e");
    
    // Add all parameters to query string
    n8nUrl.searchParams.append("jobId", jobId);
    n8nUrl.searchParams.append("webhookUrl", webhookUrl);
    n8nUrl.searchParams.append("character", character);
    n8nUrl.searchParams.append("script", script);

    // Timeout after 30s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log("Triggering N8N webhook with GET", { 
      jobId, 
      character, 
      webhookUrl,
      scriptPreview: `${String(script).slice(0, 60)}...` 
    });

    const resp = await fetch(n8nUrl.toString(), {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await resp.text();
    if (!resp.ok) {
      console.error("N8N webhook failed", resp.status, text);
      return new Response(
        JSON.stringify({ ok: false, status: resp.status, body: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("N8N webhook accepted", { jobId, status: resp.status });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const isAbort = (e as any)?.name === "AbortError";
    console.error("trigger-video-generation error", e);
    return new Response(
      JSON.stringify({ error: isAbort ? "Request timeout" : (e as Error).message }),
      { status: isAbort ? 504 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
