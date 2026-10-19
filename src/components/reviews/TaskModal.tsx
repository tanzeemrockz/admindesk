import React, { useState } from 'react';
import { Project, Profile, TaskPriority } from '../../types/database';
import { Input, Select, Button, Modal } from '../ui';

interface TaskModalProps {
  projects: Project[];
  profiles: Profile[];
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    project_id: string | null;
    assigned_to_id: string | null;
    preview_url: string;
    github_pr_url: string;
    priority: TaskPriority;
  }) => void;
}

export function TaskModal({ projects, profiles, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [githubPrUrl, setGithubPrUrl] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      project_id: projectId || null,
      assigned_to_id: assignedToId || null,
      preview_url: previewUrl.trim(),
      github_pr_url: githubPrUrl.trim(),
      priority
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create QA / Review Task"
      description="Assign task with Pull Request links and staging deployment verification."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Task Title & Deliverable"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement Responsive Navigation & Header"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Linked Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">General / Internal Task</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </Select>

          <Select
            label="Task Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent / Blocker</option>
          </Select>
        </div>

        <Select
          label="Assigned Team Member"
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {profiles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name} ({m.role})
            </option>
          ))}
        </Select>

        <Input
          label="Vercel Staging / Preview URL (Optional)"
          type="url"
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
          placeholder="https://preview.vercel.app"
        />

        <Input
          label="GitHub Pull Request URL (Optional)"
          type="url"
          value={githubPrUrl}
          onChange={(e) => setGithubPrUrl(e.target.value)}
          placeholder="https://github.com/organization/repo/pull/1"
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
