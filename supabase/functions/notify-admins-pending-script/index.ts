import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { scriptId, influencer, scheduledDate, topic } = await req.json();

    console.log('Notifying admins for pending script:', { scriptId, influencer });

    // Fetch all admins
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('role', 'admin');

    if (adminsError) {
      throw new Error(`Failed to fetch admins: ${adminsError.message}`);
    }

    if (!admins || admins.length === 0) {
      console.log('No admins found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare webhook data
    const adminNames = admins.map(a => a.full_name || 'Admin').join(',');
    const adminEmails = admins.map(a => a.email).filter(Boolean).join(',');

    // Call webhook
    const webhookUrl = 'https://n8n.srv905291.hstgr.cloud/webhook/3ac7a83a-94f9-4f57-80d5-e48685187d8e';
    const webhookParams = new URLSearchParams({
      adminNames,
      adminEmails,
      scriptId: scriptId || '',
      influencer: influencer || '',
      scheduledDate: scheduledDate || '',
      topic: topic || ''
    });

    console.log('Calling webhook:', `${webhookUrl}?${webhookParams}`);

    const webhookResponse = await fetch(`${webhookUrl}?${webhookParams}`, {
      method: 'GET',
    });

    if (!webhookResponse.ok) {
      console.error('Webhook call failed:', webhookResponse.status);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${admins.length} admin(s)`,
        admins: adminEmails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-admins-pending-script:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
