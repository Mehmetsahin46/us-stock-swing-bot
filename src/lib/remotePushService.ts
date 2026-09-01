export interface NotificationConfig {
  ntfyTopic?: string; // ntfy.sh topic (e.g. 'swingbot-mehmetsahin')
  telegramBotToken?: string;
  telegramChatId?: string;
  minScore?: number;
  notifyOnBuy?: boolean;
  notifyOnTp1?: boolean;
  notifyOnSl?: boolean;
}

export async function sendRemotePhoneNotification(
  title: string,
  message: string,
  priority: 'high' | 'normal' = 'normal',
  tags: string[] = ['chart_with_upwards_trend', 'bell']
): Promise<void> {
  const topic = process.env.NEXT_PUBLIC_NTFY_TOPIC || 'swingbot-live-alerts';

  // 1. ntfy.sh Push Notification (Works 100% on iOS & Android even with screen locked)
  try {
    const ntfyUrl = `https://ntfy.sh/${topic}`;
    await fetch(ntfyUrl, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': priority === 'high' ? 'high' : 'default',
        'Tags': tags.join(','),
        'Click': 'https://us-stock-swing-bot.vercel.app'
      },
      body: message
    });
  } catch (err) {
    console.error('[RemotePush] Error sending ntfy notification:', err);
  }

  // 2. Telegram Bot Push Notification (If configured via ENV)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  if (tgToken && tgChatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: `🔔 *${title}*\n\n${message}\n\n👉 [Panele Git](https://us-stock-swing-bot.vercel.app)`,
          parse_mode: 'Markdown'
        })
      });
    } catch (tgErr) {
      console.error('[RemotePush] Error sending Telegram message:', tgErr);
    }
  }
}
