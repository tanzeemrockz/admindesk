import { Task, Project, Profile, TaskStatus } from '../../types/database';
import { safeUrl } from '../../lib/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  IconPlus,
  IconTrash,
  IconGitPullRequest,
  IconExternalLink,
  IconCheckSquare
} from '../../lib/icons';

interface ReviewBoardViewProps {
  tasks: Task[];
  projects: Project[];
  profiles: Profile[];
  isAdmin: boolean;
  onOpenTaskModal: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

const STAGES: TaskStatus[] = ['To Do', 'In Progress', 'Needs Review', 'Approved'];

export function ReviewBoardView({
  tasks,
  projects,
  profiles,
  isAdmin,
  onOpenTaskModal,
  onUpdateTaskStatus,
  onDeleteTask
}: ReviewBoardViewProps) {
  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return 'rose' as const;
      case 'High':
        return 'amber' as const;
      case 'Medium':
        return 'cyber' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-bold text-white tracking-tight">Engineering Review Pipeline</h1>
            <Badge variant="neutral" size="xs">{tasks.length} tasks</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Continuous staging review, pull request verification, and QA sign-off gates.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenTaskModal}
          leftIcon={<IconPlus className="w-3.5 h-3.5" />}
        >
          Add Task
        </Button>
      </div>

      {/* 4-Stage Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const items = tasks.filter((t) => t.status === stage);
          const isReviewStage = stage === 'Needs Review';

          return (
            <div
              key={stage}
              className={`bg-[#0a0a0a] border rounded-lg p-3 flex flex-col gap-2.5 min-h-[480px] shadow-xs ${
                isReviewStage && items.length > 0
                  ? 'border-amber-500/30 bg-amber-500/[0.01]'
                  : 'border-[#222222]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#222222]">
                <span className="font-display text-xs font-semibold text-white tracking-tight">
                  {stage}
                </span>
                <Badge
                  variant={isReviewStage && items.length > 0 ? 'amber' : 'neutral'}
                  size="xs"
                >
                  {items.length}
                </Badge>
              </div>

              {/* Column Body / Cards List */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center space-y-1 text-[#666666]">
                    <IconCheckSquare className="w-4 h-4 opacity-40 mb-1" />
                    <span className="text-[11px] font-sans">No tasks in this stage</span>
                  </div>
                ) : (
                  items.map((t) => {
                    const assignee = profiles.find((p) => p.id === t.assigned_to_id);
                    const proj = projects.find((p) => p.id === t.project_id);
                    const cleanPreviewUrl = safeUrl(t.preview_url);
                    const cleanPrUrl = safeUrl(t.github_pr_url);

                    return (
                      <div
                        key={t.id}
                        className={`bg-black border rounded-md p-3 space-y-2.5 transition-all duration-150 shadow-xs ${
                          isReviewStage
                            ? 'border-amber-500/40 bg-amber-500/[0.02]'
                            : 'border-[#222222] hover:border-[#383838]'
                        }`}
                      >
                        {/* Task Title & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-white leading-snug font-sans">
                            {t.title}
                          </p>
                          {isAdmin && (
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              className="text-[#666666] hover:text-rose-400 p-0.5 rounded transition-colors shrink-0"
                              title="Delete task"
                            >
                              <IconTrash className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Priority & Project Tag */}
                        <div className="flex items-center flex-wrap gap-1.5">
                          <Badge variant={getPriorityBadgeVariant(t.priority)} size="xs">
                            {t.priority || 'Normal'}
                          </Badge>
                          {proj ? (
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#111111] border border-[#222222] text-[#a1a1a1] truncate max-w-[140px]">
                              {proj.title}
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111111] text-[#666666] font-mono">
                              Internal
                            </span>
                          )}
                        </div>

                        {/* Assignee Pill */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#888888] font-sans">
                          <div className="w-4 h-4 rounded-full bg-[#181818] border border-[#2e2e2e] flex items-center justify-center font-bold text-[9px] text-[#ededed]">
                            {assignee?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="truncate">
                            {assignee ? assignee.full_name : 'Unassigned'}
                          </span>
                        </div>

                        {/* Staging & PR External Links */}
                        {(cleanPreviewUrl || cleanPrUrl) && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1c1c1c]">
                            {cleanPrUrl && (
                              <a
                                href={cleanPrUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-6 px-2 bg-[#0a0a0a] hover:bg-[#141414] border border-[#222222] hover:border-[#383838] text-[11px] font-mono text-[#a1a1a1] hover:text-white rounded flex items-center gap-1 transition-colors"
                              >
                                <IconGitPullRequest className="w-3 h-3 text-indigo-400" />
                                <span>PR</span>
                              </a>
                            )}
                            {cleanPreviewUrl && (
                              <a
                                href={cleanPreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-6 px-2 bg-[#0a0a0a] hover:bg-[#141414] border border-[#222222] hover:border-[#383838] text-[11px] font-mono text-[#a1a1a1] hover:text-white rounded flex items-center gap-1 transition-colors"
                              >
                                <IconExternalLink className="w-3 h-3 text-cyan-400" />
                                <span>Preview</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-[#1c1c1c]">
                          <select
                            value={t.status}
                            onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                            className="w-full h-6.5 px-2 bg-black border border-[#222222] hover:border-[#383838] focus:border-white rounded text-[11px] text-[#ededed] focus:outline-none cursor-pointer font-sans transition-colors"
                          >
                            {STAGES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
