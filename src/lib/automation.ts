'use server';

/**
 * Utility to trigger external n8n automations via webhooks.
 * All triggers are non-blocking to ensure the main application flow remains fast.
 */
export async function triggerAutomation(
  event: 'check_in' | 'absences_synced', 
  data: any
) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  // Silently skip if no webhook is configured
  if (!webhookUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Automation] Skipped: ${event}. Add N8N_WEBHOOK_URL to your .env to enable.`);
    }
    return;
  }

  try {
    // Non-blocking fetch
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    }).then(response => {
      if (!response.ok) {
        console.error(`[Automation] ❌ Webhook ${event} returned FIXED error ${response.status}: ${response.statusText}`);
      } else {
        console.log(`[Automation] ✅ Webhook ${event} acknowledged (Status ${response.status})`);
      }
    }).catch(err => {
      console.error(`[Automation] 🚨 Webhook ${event} connection failed:`, err.message);
      console.log(`[Automation] 💡 Tip: Is n8n running and listening on ${webhookUrl.split('/')[2]}?`);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Automation] Triggered: ${event}`);
    }
  } catch (err) {
    console.error(`[Automation] Setup error for ${event}:`, err);
  }
}
