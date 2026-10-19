import React, { useState } from 'react';
import { Client, MilestoneStage } from '../../types/database';
import { formatINR } from '../../lib/formatters';
import { Input, Select, Button, Modal } from '../ui';

interface ProjectModalProps {
  clients: Client[];
  onClose: () => void;
  onSubmit: (project: {
    title: string;
    client_id: string | null;
    fee_inr: number;
    advance_inr: number;
    github_url: string;
    vercel_url: string;
    domain_url: string;
    drive_url: string;
    milestone_stage: MilestoneStage;
  }) => void;
}

export function ProjectModal({ clients, onClose, onSubmit }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [feeInr, setFeeInr] = useState(45000);
  const [advanceInr, setAdvanceInr] = useState(22500);
  const [githubUrl, setGithubUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [domainUrl, setDomainUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [milestoneStage, setMilestoneStage] = useState<MilestoneStage>('Milestone 1 (50% Advance)');

  const balanceDue = Math.max(0, feeInr - advanceInr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      client_id: clientId || null,
      fee_inr: Number(feeInr) || 0,
      advance_inr: Number(advanceInr) || 0,
      github_url: githubUrl.trim(),
      vercel_url: vercelUrl.trim(),
      domain_url: domainUrl.trim(),
      drive_url: driveUrl.trim(),
      milestone_stage: milestoneStage
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Project Contract"
      description="Initialize agency deliverables, milestone gate, and repository settings."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Project Contract Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Modern Web Platform & Brand Redesign"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select Confirmed Client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </Select>

          <Select
            label="Initial Payment Gate"
            value={milestoneStage}
            onChange={(e) => setMilestoneStage(e.target.value as MilestoneStage)}
          >
            <option value="Milestone 1 (50% Advance)">Milestone 1 (50% Advance)</option>
            <option value="Milestone 2 (30% Staging)">Milestone 2 (30% Staging)</option>
            <option value="Milestone 3 (20% Launch)">Milestone 3 (20% Launch)</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Total Contract Fee (INR ₹)"
            type="number"
            min="0"
            required
            value={feeInr}
            onChange={(e) => setFeeInr(Number(e.target.value))}
          />
          <Input
            label="Advance Collected (INR ₹)"
            type="number"
            min="0"
            required
            value={advanceInr}
            onChange={(e) => setAdvanceInr(Number(e.target.value))}
          />
        </div>

        {/* Real-time financial summary */}
        <div className="p-2.5 rounded-md bg-black border border-[#222222] flex items-center justify-between text-[11px] font-sans">
          <span className="text-[#888888]">Calculated Balance Due:</span>
          <span className="text-amber-400 font-semibold font-mono">
            {formatINR(balanceDue)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="GitHub Repository URL"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/organization/repo"
          />
          <Input
            label="Vercel Staging URL"
            type="url"
            value={vercelUrl}
            onChange={(e) => setVercelUrl(e.target.value)}
            placeholder="https://preview.vercel.app"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Live Domain URL"
            type="url"
            value={domainUrl}
            onChange={(e) => setDomainUrl(e.target.value)}
            placeholder="https://clientbrand.com"
          />
          <Input
            label="Google Drive Assets Folder"
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
