import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running approval reminders cron job...');

    // Fetch all pending scripts
    const { data: pendingScripts, error: scriptsError } = await supabase
      .from('content_calendar')
      .select('id, influencer_name, scheduled_date, topic, reminder_count')
      .eq('approval_status', 'pending');

    if (scriptsError) {
      throw new Error(`Failed to fetch pending scripts: ${scriptsError.message}`);
    }

    if (!pendingScripts || pendingScripts.length === 0) {
      console.log('No pending scripts found');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending scripts' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingScripts.length} pending script(s)`);

    // Fetch all admins
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('role', 'admin');

    if (adminsError || !admins || admins.length === 0) {
      console.log('No admins found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const adminNames = admins.map(a => a.full_name || 'Admin').join(',');
    const adminEmails = admins.map(a => a.email).filter(Boolean).join(',');

    // Send reminder for each pending script
    const webhookUrl = 'https://n8n.srv905291.hstgr.cloud/webhook/3ac7a83a-94f9-4f57-80d5-e48685187d8e';

    for (const script of pendingScripts) {
      const webhookParams = new URLSearchParams({
        adminNames,
        adminEmails,
        scriptId: script.id,
        influencer: script.influencer_name || '',
        scheduledDate: script.scheduled_date || '',
        topic: script.topic || '',
        reminderCount: String((script.reminder_count || 0) + 1)
      });

      console.log(`Sending reminder for script ${script.id}`);

      await fetch(`${webhookUrl}?${webhookParams}`, { method: 'GET' });

      // Update reminder count
      await supabase
        .from('content_calendar')
        .update({
          reminder_count: (script.reminder_count || 0) + 1,
          last_reminder_sent_at: new Date().toISOString()
        })
        .eq('id', script.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent reminders for ${pendingScripts.length} script(s)`
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-approval-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
