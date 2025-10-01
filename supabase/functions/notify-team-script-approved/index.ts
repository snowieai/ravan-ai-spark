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

    const { scriptId, influencer, status, approvedBy, remarks } = await req.json();

    console.log('Notifying team for script status:', { scriptId, status, influencer });

    // Fetch team members (non-admin users)
    const { data: teamMembers, error: teamError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .neq('role', 'admin');

    if (teamError) {
      throw new Error(`Failed to fetch team members: ${teamError.message}`);
    }

    if (!teamMembers || teamMembers.length === 0) {
      console.log('No team members found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No team members to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare webhook data
    const teamEmails = teamMembers.map(t => t.email).filter(Boolean).join(',');

    // Call webhook
    const webhookUrl = 'https://n8n.srv905291.hstgr.cloud/webhook/9e35f602-5d22-4e0a-9a2b-dbbb5bc03bd2';
    const webhookParams = new URLSearchParams({
      status: status || '',
      scriptId: scriptId || '',
      influencer: influencer || '',
      approvedBy: approvedBy || '',
      remarks: remarks || '',
      teamEmails
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
        message: `Notified ${teamMembers.length} team member(s)`,
        team: teamEmails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-team-script-approved:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
