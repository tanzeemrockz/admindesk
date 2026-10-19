import React, { useState } from 'react';
import { Project, IntakeChecklist } from '../../types/database';
import { AssetDropzone } from './AssetDropzone';
import { Button, Input, Badge, Modal } from '../ui';
import { IconCheck } from '../../lib/icons';

interface IntakeModalProps {
  project: Project;
  onClose: () => void;
  onSaveIntake: (projectId: string, checklist: IntakeChecklist, driveUrl: string) => void;
}

const INTAKE_ITEMS: Array<{ key: keyof IntakeChecklist; label: string }> = [
  { key: 'logo', label: 'Vector / Transparent PNG Logo' },
  { key: 'images', label: 'High-Res Hero & Lookbook Photos' },
  { key: 'bio', label: 'About Business Story & Founder Bio' },
  { key: 'catalog', label: 'Service / Product List & Pricing' },
  { key: 'contact', label: 'Phone, Email & Map Address' },
  { key: 'socials', label: 'Instagram, LinkedIn & Socials' },
  { key: 'colors', label: 'Brand Color Palette & Fonts' },
  { key: 'reviews', label: 'Customer Testimonials & Social Proof' }
];

export function IntakeModal({ project, onClose, onSaveIntake }: IntakeModalProps) {
  const [checklist, setChecklist] = useState<IntakeChecklist>(project.intake_checklist || {});
  const [driveUrl, setDriveUrl] = useState(project.drive_url || '');

  const toggleItem = (key: keyof IntakeChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const pct = Math.round((completedCount / INTAKE_ITEMS.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIntake(project.id, checklist, driveUrl.trim());
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="8-Point Asset Intake Verification"
      description={project.title}
      badge={<Badge variant="neutral" size="xs">{completedCount}/8</Badge>}
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="bg-black border border-[#222222] rounded-md p-3 space-y-1.5">
          <div className="flex justify-between text-[11px] text-[#ededed] font-sans">
            <span>Readiness Score</span>
            <span className="text-emerald-400 font-semibold font-mono">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#222222]">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTAKE_ITEMS.map((item) => {
              const checked = Boolean(checklist[item.key]);

              return (
                <div
                  key={item.key}
                  onClick={() => toggleItem(item.key)}
                  className={`flex items-center gap-2.5 p-2 rounded-md border cursor-pointer select-none transition-colors ${
                    checked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-black border-[#222222] text-[#888888] hover:border-[#383838]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-[#2e2e2e] bg-[#141414]'
                    }`}
                  >
                    {checked && <IconCheck className="w-3 h-3 text-black font-bold" />}
                  </div>
                  <span className="text-[11px] font-sans font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>

          <Input
            label="Google Drive Asset Folder Link"
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
          />

          {/* Direct Storage Dropzone */}
          <AssetDropzone projectSlug={project.id} />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Intake Status
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
