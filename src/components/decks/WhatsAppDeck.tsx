import React, { useState } from 'react';
import { Client, Lead } from '../../types/database';
import {
  IconWhatsApp,
  IconSend,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconKey
} from '../../lib/icons';

interface WhatsAppDeckProps {
  clients?: Client[];
  leads?: Lead[];
}

export function WhatsAppDeck({ clients = [], leads = [] }: WhatsAppDeckProps) {
  const [targetPhone, setTargetPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('intro');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Meta Cloud API State
  const [phoneId, setPhoneId] = useState(() => localStorage.getItem('csc_wa_phone_id') || '');
  const [waToken, setWaToken] = useState(() => localStorage.getItem('csc_wa_token') || '');
  const [metaSaved, setMetaSaved] = useState(false);

  // Templates
  const templates: Record<string, { label: string; text: (name: string, company: string) => string }> = {
    intro: {
      label: 'Cold Prospect / High-Value Proposal',
      text: (name, comp) =>
        `Hi ${name || 'there'},\n\nI'm Mohamed Tanzeem, Founder of CyberSlayerCorpz (CSC). We engineer high-performance web platforms, custom branding, and scalable cloud infrastructure.\n\nI reviewed ${comp || 'your business'} and noticed opportunities to significantly enhance your web presence, speed, and customer conversion rates.\n\nWould you be open to a brief 10-minute discovery call this week?`
    },
    intake: {
      label: 'Asset Intake & Discovery Reminder',
      text: (name, comp) =>
        `Hi ${name || 'there'},\n\nHope you're having a productive week! Your client staging workspace at CyberSlayerCorpz for ${comp || 'your project'} has been initialized.\n\nTo keep our sprint timeline on schedule, please review the asset intake checklist and share your logo files, high-resolution imagery, and copy.\n\nLet me know if you need any assistance uploading the files.`
    },
    review: {
      label: 'Staging Milestone Ready for QA',
      text: (name, comp) =>
        `Hi ${name || 'there'},\n\nGreat news! The current development milestone for ${comp || 'your project'} has passed internal code review and is live on our secure staging environment.\n\nPlease test the link on your mobile and desktop devices and let us know your feedback within the client portal.\n\nLooking forward to your sign-off!`
    },
    launch: {
      label: 'DNS Cutover & Production Launch',
      text: (name, comp) =>
        `Hi ${name || 'there'},\n\nAll staging checklist items for ${comp || 'your project'} have been signed off. We are scheduled to execute the production DNS cutover and SSL provisioning.\n\nPlease ensure your domain registrar credentials or Nameserver delegations are ready.\n\nExcited to take your platform live!`
    },
    invoice: {
      label: 'Final Milestone & Project Handover',
      text: (name, comp) =>
        `Hi ${name || 'there'},\n\nYour project is officially live in production! We have finalized repository handovers and documentation.\n\nPlease find the final milestone summary and invoice in your CSC Client Portal.\n\nThank you for partnering with CyberSlayerCorpz!`
    }
  };

  const getActiveText = () => {
    if (customMessage) return customMessage;
    const tpl = templates[selectedTemplate];
    return tpl ? tpl.text(contactName, companyName) : '';
  };

  const handleSelectClient = (clientId: string) => {
    const cl = clients.find((c) => c.id === clientId);
    if (cl) {
      setContactName(cl.contact_person);
      setCompanyName(cl.company_name);
      setTargetPhone(cl.phone || '');
      setCustomMessage('');
    }
  };

  const handleSelectLead = (leadId: string) => {
    const ld = leads.find((l) => l.id === leadId);
    if (ld) {
      setContactName(ld.name);
      setCompanyName(ld.company || ld.name);
      setTargetPhone(ld.phone || '');
      setCustomMessage('');
    }
  };

  const handleLaunchWhatsApp = () => {
    if (!targetPhone.trim()) {
      setPhoneError('Please enter a target phone number before launching WhatsApp.');
      return;
    }
    setPhoneError('');
    const clean = targetPhone.replace(/\D/g, '');
    const finalPhone = clean.startsWith('91') && clean.length > 10 ? clean : `91${clean.slice(-10)}`;
    const text = encodeURIComponent(getActiveText());
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };


  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('csc_wa_phone_id', phoneId);
    localStorage.setItem('csc_wa_token', waToken);
    setMetaSaved(true);
    setTimeout(() => setMetaSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-emerald-400">
            <IconWhatsApp className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold font-display text-white">WhatsApp Outreach Gateway</h1>
            <p className="text-xs text-zinc-400">
              Instant client communications, milestone notices, intake reminders, and automated wa.me deep links.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer (8 cols) & Meta Cloud API (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Composer & Deep Link Generator (8 cols) */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Message Drafter &amp; Dispatcher
            </h2>

            {/* Quick Pickers */}
            <div className="flex items-center gap-2">
              {clients.length > 0 && (
                <select
                  onChange={(e) => handleSelectClient(e.target.value)}
                  defaultValue=""
                  className="bg-base border border-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="" disabled>Choose from Clients...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.contact_person})
                    </option>
                  ))}
                </select>
              )}

              {leads.length > 0 && (
                <select
                  onChange={(e) => handleSelectLead(e.target.value)}
                  defaultValue=""
                  className="bg-base border border-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="" disabled>Choose from Leads...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company || l.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Recipient Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Princy / Mr. Jailani"
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Company / Project Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Princy Boutique"
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                WhatsApp Phone (+91)
              </label>
              <input
                type="tel"
                value={targetPhone}
                onChange={(e) => {
                  setTargetPhone(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                placeholder="e.g. 9840012345"
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />

            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Select Strategic Communication Template
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(templates).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTemplate(key);
                    setCustomMessage('');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedTemplate === key
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'bg-base hover:bg-elevated border border-border text-zinc-300'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-zinc-400">
                Message Body (Live Preview / Editable)
              </label>
              <button
                onClick={handleCopyMessage}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <IconCheck className="w-3 h-3 text-emerald-400" /> : <IconCopy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={getActiveText()}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-base border border-border rounded-xl text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-zinc-500"
            />
          </div>

          {phoneError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {phoneError}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleLaunchWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
            >
              <IconSend className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Web / App</span>
            </button>
          </div>

        </div>

        {/* Right: Meta Cloud API Settings (4 cols) */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <IconKey className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Meta Cloud API Configuration
            </h2>
          </div>

          <form onSubmit={handleSaveMeta} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                WhatsApp Phone Number ID
              </label>
              <input
                type="text"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                placeholder="e.g. 104928472918234"
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                System User Access Token
              </label>
              <input
                type="password"
                value={waToken}
                onChange={(e) => setWaToken(e.target.value)}
                placeholder="EAAB••••••••••••••••••••••••••••"
                className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            {metaSaved && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                Settings saved successfully!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-zinc-800 border border-border text-white font-semibold text-xs transition"
            >
              Save Cloud API Credentials
            </button>
          </form>

          <div className="text-[11px] text-zinc-400 space-y-2 pt-2 border-t border-border">
            <p className="leading-relaxed">
              Configuring the Meta WhatsApp Business Cloud API enables direct server-to-server dispatch of automated transaction notices without prompting client browser tabs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
