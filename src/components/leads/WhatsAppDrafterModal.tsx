import { useState, useEffect } from 'react';
import { formatWhatsAppNumber } from '../../lib/formatters';
import { INTAKE_FORM_URL } from '../../lib/supabase';
import { IconWhatsApp, IconZoho, IconCopy, IconCheck, IconAlertCircle } from '../../lib/icons';
import { Button, Input, Select, Modal } from '../ui';

interface WhatsAppDrafterModalProps {
  initialPhone?: string;
  initialBusinessName?: string;
  onClose: () => void;
}

const PRESET_OPTIONS = [
  { value: 'pitch', label: '1. Cold Lookbook Outreach Pitch' },
  { value: 'intake', label: '2. Client Onboarding & 8-Point Asset Intake Link' },
  { value: 'staging', label: '3. Vercel Staging Mobile Preview Ready' },
  { value: 'payment', label: '4. Payment Milestone Invoice Notice' },
];

export function WhatsAppDrafterModal({ initialPhone = '', initialBusinessName = '', onClose }: WhatsAppDrafterModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [preset, setPreset] = useState<'pitch' | 'intake' | 'staging' | 'payment'>('pitch');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const name = businessName.trim() || 'there';
    switch (preset) {
      case 'pitch':
        setMessage(`Hi ${name}! We build fast, mobile-first digital lookbooks and web catalogs for growing businesses at CyberSlayerCorpz (CSC). I saw your great reviews on Google Maps and would love to share a free interactive preview idea for your brand!`);
        break;
      case 'intake':
        setMessage(`Hi ${name}! Excited to get started on your website build with CyberSlayerCorpz (CSC). Please upload your brand logo, hero photos, and catalog on our official intake form here: ${INTAKE_FORM_URL}`);
        break;
      case 'staging':
        setMessage(`Hi ${name}! Your live staging preview is ready for review on mobile. Please test it on your smartphone and let us know if you'd like any adjustments before we point your official domain!`);
        break;
      case 'payment':
        setMessage(`Hi ${name}! Milestone payment invoice update from CyberSlayerCorpz (CSC). Please find our official UPI & bank transfer details in your dashboard, and let us know once transferred so we can unlock the next delivery phase!`);
        break;
    }
  }, [preset, businessName]);

  const handleLaunchWhatsApp = () => {
    const cleanPhone = formatWhatsAppNumber(phone);
    if (!cleanPhone) {
      setError('Please enter a valid 10-digit Indian mobile number or full international number.');
      return;
    }
    setError('');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyZoho = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open('https://mail.zoho.in', '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="WhatsApp & Zoho Dispatcher"
      description="Pre-formatted outreach with automatic +91 country dialing"
      badge={
        <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <IconWhatsApp className="w-3 h-3 text-emerald-400" />
        </div>
      }
    >
      <div className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Business / Contact Name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Apex Studio"
          />
          <Input
            label="WhatsApp Mobile (+91 auto)"
            type="text"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            placeholder="10-digit mobile"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 text-xs">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Template Preset"
          value={preset}
          onChange={(e) => setPreset(e.target.value as any)}
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-xs font-medium text-[#ededed] mb-1.5">Message Body</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-[#222222] focus:border-white rounded-md text-xs text-[#ededed] placeholder:text-[#555555] focus:outline-none transition resize-none leading-relaxed font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#222222]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyZoho}
            leftIcon={copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
          >
            <IconZoho className="w-3.5 h-3.5 text-[#888888] mr-1" />
            <span>Copy for Zoho Mail</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleLaunchWhatsApp}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold border-transparent"
            leftIcon={<IconWhatsApp className="w-4 h-4" />}
          >
            Launch WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
