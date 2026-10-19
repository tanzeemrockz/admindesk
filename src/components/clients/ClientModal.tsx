import React, { useState } from 'react';
import { Button, Input, Modal } from '../ui';

interface ClientModalProps {
  onClose: () => void;
  onSubmit: (client: {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
  }) => void;
}

export function ClientModal({ onClose, onSubmit }: ClientModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    onSubmit({
      company_name: companyName.trim(),
      contact_person: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim()
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Confirmed Client"
      description="Register an official client account for tracking &amp; portals."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Company / Brand Name"
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Apex Studio"
        />

        <Input
          label="Contact Person"
          type="text"
          required
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="e.g. Rahul Sharma"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@company.com"
          />
          <Input
            label="Phone (WhatsApp)"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Add Client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
