import React, { useState } from 'react';
import { LeadSource } from '../../types/database';
import { Button, Input, Select, Modal } from '../ui';

interface LeadModalProps {
  onClose: () => void;
  onSubmit: (lead: {
    name: string;
    company: string;
    source: LeadSource;
    phone: string;
    estimated_value_inr: number;
    notes: string;
  }) => void;
}

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'Google Maps', label: 'Google Maps' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Reddit', label: 'Reddit' },
  { value: 'Cold Email', label: 'Cold Email' },
  { value: 'Referral', label: 'Referral' },
];

export function LeadModal({ onClose, onSubmit }: LeadModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState<LeadSource>('Google Maps');
  const [phone, setPhone] = useState('');
  const [valueInr, setValueInr] = useState(40000);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      company: company.trim(),
      source,
      phone: phone.trim(),
      estimated_value_inr: Number(valueInr) || 0,
      notes: notes.trim()
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Log Outreach / Inbound Lead"
      description="Register prospect details and pipeline estimates."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Contact Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Business / Brand"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Silk Sarees Boutique"
          />

          <Select
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp / Phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <Input
            label="Est. Deal Value (INR ₹)"
            type="number"
            min="0"
            value={valueInr}
            onChange={(e) => setValueInr(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#ededed] mb-1.5">Notes &amp; Requirements</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Requirements, budget discussion, or initial feedback..."
            className="w-full px-3 py-2 bg-black border border-[#222222] focus:border-white rounded-md text-xs text-[#ededed] placeholder:text-[#555555] focus:outline-none transition resize-none font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}
