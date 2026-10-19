export async function sendDiscordNotification(
  webhookUrl: string,
  title: string,
  description: string,
  colorHex = 0x10b981,
  fields?: Array<{ name: string; value: string; inline?: boolean }>
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return {
      success: false,
      message: 'Valid Discord webhook URL (https://discord.com/api/webhooks/...) required.'
    };
  }

  try {
    const payload = {
      username: 'CSC Operations Desk',
      avatar_url: 'https://cyberslayercorpz.dev/favicon.ico',
      embeds: [
        {
          title,
          description,
          color: colorHex,
          fields: fields || [],
          footer: {
            text: 'CyberSlayerCorpz — CSC Operations Desk'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 204) {
      return { success: true, message: 'Notification delivered to Discord server.' };
    }
    return { success: false, message: `Discord error: HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to dispatch Discord alert.' };
  }
}
