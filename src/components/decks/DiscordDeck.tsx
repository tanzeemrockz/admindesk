import React, { useState, useEffect } from 'react';
import { sendDiscordNotification } from '../../services/discordService';
import {
  IconDiscord,
  IconSend,
  IconCheckCircle,
  IconAlertCircle,
  IconKey,
  IconZap
} from '../../lib/icons';

interface DiscordDeckProps {
  initialWebhookUrl?: string;
  onUpdateWebhook?: (url: string) => void;
}

export function DiscordDeck({ initialWebhookUrl = '', onUpdateWebhook }: DiscordDeckProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('csc_discord_webhook') || initialWebhookUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [embedColor, setEmbedColor] = useState<number>(0x10b981);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [webhookUrl]);

  const showNotice = (text: string, type: 'success' | 'error') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('csc_discord_webhook', webhookUrl);
    if (onUpdateWebhook) onUpdateWebhook(webhookUrl);
    if (webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setIsConnected(true);
      showNotice('Discord webhook URL saved.', 'success');
    } else {
      setIsConnected(false);
      showNotice('Invalid webhook format. Must start with https://discord.com/api/webhooks/', 'error');
    }
  };

  const handleBroadcast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!webhookUrl || !alertTitle.trim() || !alertMessage.trim()) return;

    setIsBroadcasting(true);
    const result = await sendDiscordNotification(webhookUrl, alertTitle, alertMessage, embedColor);
    setIsBroadcasting(false);

    if (result.success) {
      showNotice(result.message, 'success');
      setAlertTitle('');
      setAlertMessage('');
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handleQuickPreset = (title: string, msg: string, color: number) => {
    setAlertTitle(title);
    setAlertMessage(msg);
    setEmbedColor(color);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-indigo-400">
            <IconDiscord className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-white">Discord Operations Broadcaster</h1>
              {isConnected && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Webhook Connected
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Real-time engineering notifications, QA review pings, and milestone deployments broadcast to team channels.
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Composer (8 cols) and Webhook Settings (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rich Embed Composer (8 cols) */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Compose Rich Notification Embed
            </h2>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Task Submitted for QA Review',
                    'Developer has pushed commits and staged the feature. Review required before merging to main.',
                    0xf59e0b
                  )
                }
                className="px-2 py-1 rounded bg-base hover:bg-elevated border border-border text-[11px] text-amber-300 transition"
              >
                QA Review
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Production Deployment Completed',
                    'Vercel edge build successfully deployed to production domains with SSL active.',
                    0x10b981
                  )
                }
                className="px-2 py-1 rounded bg-base hover:bg-elevated border border-border text-[11px] text-emerald-300 transition"
              >
                Deployment
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'New High-Value Lead Discovered',
                    'Google Maps prospect identified with missing website. Lead scored and imported to CRM.',
                    0x6366f1
                  )
                }
                className="px-2 py-1 rounded bg-base hover:bg-elevated border border-border text-[11px] text-indigo-300 transition"
              >
                Lead Discovered
              </button>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Notification Title / Event Header
              </label>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g. Staging Review Required: Princy Boutique"
                required
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Embed Details &amp; Payload Description
              </label>
              <textarea
                rows={4}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter detailed notification content, branch links, or contract updates..."
                required
                className="w-full p-3 bg-base border border-border rounded-xl text-xs text-white leading-relaxed focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400">Embed Color:</span>
                {[
                  { label: 'Emerald', hex: 0x10b981, bg: 'bg-emerald-500' },
                  { label: 'Amber', hex: 0xf59e0b, bg: 'bg-amber-500' },
                  { label: 'Indigo', hex: 0x6366f1, bg: 'bg-indigo-500' },
                  { label: 'Rose', hex: 0xf43f5e, bg: 'bg-rose-500' }
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setEmbedColor(c.hex)}
                    className={`w-5 h-5 rounded-full ${c.bg} transition ${
                      embedColor === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isBroadcasting || !isConnected || !alertTitle.trim() || !alertMessage.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
              >
                <IconSend className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to Discord'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Webhook Settings (4 cols) */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <IconKey className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Discord Webhook URL
            </h2>
          </div>

          <form onSubmit={handleSaveWebhook} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Channel Webhook Endpoint
              </label>
              <input
                type="password"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-zinc-800 border border-border text-white font-semibold text-xs transition"
            >
              Save Webhook Configuration
            </button>
          </form>

          <div className="text-[11px] text-zinc-400 space-y-2 pt-2 border-t border-border">
            <span className="font-semibold text-zinc-200">How to create a Webhook:</span>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
              <li>Open your Discord server settings or channel settings.</li>
              <li>Navigate to <strong className="text-zinc-200">Integrations</strong> $\to$ <strong className="text-zinc-200">Webhooks</strong>.</li>
              <li>Click <strong className="text-zinc-200">New Webhook</strong>, copy URL, and paste it here.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
