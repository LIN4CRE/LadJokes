import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Flame,
  Beer,
  TrendingUp,
  BarChart3,
  GripVertical,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { AdminTask, FlaggedItem, DashboardWidget } from '../types';
import { playBanterSound } from '../services/syncService';

interface AdminDashboardProps {
  tasks: AdminTask[];
  onAddTask: (task: Partial<AdminTask>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: AdminTask['status']) => void;
  flaggedItems: FlaggedItem[];
  onResolveFlag: (id: string, action: 'approved' | 'quarantined') => void;
  totalStoriesCount: number;
  totalJokesCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  flaggedItems,
  onResolveFlag,
  totalStoriesCount,
  totalJokesCount,
}) => {
  // Widget ordering and layout state for drag-and-drop
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'w-tasks', title: 'Real-Time Team Project Collaboration', type: 'team_tasks', size: 'full', order: 1 },
    { id: 'w-moderation', title: 'Content Moderation & Flagged Queue', type: 'moderation', size: 'half', order: 2 },
    { id: 'w-files', title: 'Drag-and-Drop Asset & File Manager', type: 'file_manager', size: 'half', order: 3 },
    { id: 'w-reporting', title: 'Automated Performance Reporting Generator', type: 'viral_radar', size: 'full', order: 4 },
  ]);

  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('BanterMod_Sarah');
  const [taskPriority, setTaskPriority] = useState<AdminTask['priority']>('medium');

  // File dropzone simulation state
  const [droppedFiles, setDroppedFiles] = useState<Array<{ name: string; size: string; status: string }>>([
    { name: 'prague_stag_incident_notes.pdf', size: '1.4 MB', status: 'Encrypted' },
    { name: 'amsterdam_brass_band_clip.mp4', size: '8.2 MB', status: 'Scanned' },
  ]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Drag and Drop widget reorder handlers
  const handleDragStart = (id: string) => {
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const sourceIndex = widgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIndex = widgets.findIndex((w) => w.id === targetId);

    const reordered = [...widgets];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setWidgets(reordered);
  };

  // Automated CSV Report Generation & Download
  const generateAndDownloadCSV = () => {
    playBanterSound('pint');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Period,Status\n' +
      `Total Published Banter Stories,${totalStoriesCount},All Time,Active\n` +
      `Total Book Jokes,${totalJokesCount},Volume 1,Catalogued\n` +
      'Global Outrage Index Average,84.6%,Last 30 Days,High Engagement\n' +
      'Total Anonymous Pints Spilled,14250,Last 30 Days,Trending Up\n' +
      'Active Poll Votes Cast,7158,Current Week,Healthy\n' +
      'E2E Encrypted Lounge Messages,4290,All Channels,Zero-Knowledge\n' +
      'Pending Flagged Stories,1,Today,Queue Clear\n' +
      'Platform Uptime,99.98%,Rolling Year,Production';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lad_jokes_kpi_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle.trim(),
      status: 'in_progress',
      priority: taskPriority,
      assignee: taskAssignee,
      dueDate: 'In 2 days',
    });

    playBanterSound('pop');
    setTaskTitle('');
    setShowNewTaskModal(false);
  };

  // File drop handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newItems = files.map((f) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        status: 'Uploaded',
      }));
      setDroppedFiles((prev) => [...prev, ...newItems]);
      playBanterSound('pint');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141620] via-[#171a26] to-[#10121a] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold">
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              <span>Internal Operations · Executive Management</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-wide text-white uppercase">
              ADMIN & ANALYTICS DASHBOARD
            </h2>
            <p className="text-sm text-slate-300">
              Drag-and-drop modular workspace for real-time team collaboration, story moderation, automated KPI reports, and media management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={generateAndDownloadCSV}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Automated CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#11131b] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL PUBLISHED STORIES</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalStoriesCount + totalJokesCount}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this week</span>
          </div>
        </div>

        <div className="bg-[#11131b] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>OUTRAGE INDEX AVG</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">84.6%</div>
          <div className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
            <span>High Engagement Zone</span>
          </div>
        </div>

        <div className="bg-[#11131b] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL PINTS SPILLED</span>
            <Beer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">14,250</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Community reactions</span>
          </div>
        </div>

        <div className="bg-[#11131b] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MODERATION QUEUE</span>
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {flaggedItems.filter((f) => f.status === 'pending').length}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All reports triaged</span>
          </div>
        </div>
      </div>

      {/* Reorderable Modular Dashboard Widgets */}
      <div className="space-y-6">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            draggable
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            className="bg-[#11131b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 transition-all hover:border-white/20"
          >
            {/* Widget Bar with Grip for Dragging */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
                <h3 className="text-base font-bold font-heading text-white">{widget.title}</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                DRAG TO REORDER WIDGET
              </span>
            </div>

            {/* Widget 1: Real-Time Team Collaboration & Tasks */}
            {widget.type === 'team_tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Collaborate across moderation, push campaigns, and legal compliance. Changes sync in real-time.
                  </p>
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Team Task</span>
                  </button>
                </div>

                {/* 3-column Kanban Workflow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Backlog */}
                  <div className="bg-[#0c0d12] border border-white/5 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="font-bold">BACKLOG ({tasks.filter((t) => t.status === 'backlog').length})</span>
                    </div>
                    {tasks
                      .filter((t) => t.status === 'backlog')
                      .map((task) => (
                        <div key={task.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                          <h4 className="text-xs font-medium text-slate-200">{task.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{task.assignee}</span>
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                              className="text-amber-400 hover:underline cursor-pointer"
                            >
                              Start →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* In Progress */}
                  <div className="bg-[#0c0d12] border border-white/5 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                      <span className="font-bold">IN PROGRESS ({tasks.filter((t) => t.status === 'in_progress').length})</span>
                    </div>
                    {tasks
                      .filter((t) => t.status === 'in_progress')
                      .map((task) => (
                        <div key={task.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                          <h4 className="text-xs font-medium text-white">{task.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{task.assignee}</span>
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                              className="text-emerald-400 hover:underline cursor-pointer"
                            >
                              Done ✓
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Completed */}
                  <div className="bg-[#0c0d12] border border-white/5 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span className="font-bold">COMPLETED ({tasks.filter((t) => t.status === 'completed').length})</span>
                    </div>
                    {tasks
                      .filter((t) => t.status === 'completed')
                      .map((task) => (
                        <div key={task.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2 opacity-75">
                          <h4 className="text-xs font-medium text-slate-300 line-through">{task.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{task.assignee}</span>
                            <span className="text-emerald-400">Resolved</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Widget 2: Moderation Queue */}
            {widget.type === 'moderation' && (
              <div className="space-y-3">
                {flaggedItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No active reports in the moderation queue!
                  </div>
                ) : (
                  flaggedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="font-bold text-white">{item.storyTitle}</span>
                          <span className="text-[10px] font-mono text-slate-500">· {item.timestamp}</span>
                        </div>
                        <p className="text-slate-400">{item.reason}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => {
                                onResolveFlag(item.id, 'approved');
                                playBanterSound('pint');
                              }}
                              className="py-1 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                onResolveFlag(item.id, 'quarantined');
                                playBanterSound('outrage');
                              }}
                              className="py-1 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-medium cursor-pointer"
                            >
                              Quarantine
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[11px] uppercase text-slate-400">
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Widget 3: File Manager & Dropzone */}
            {widget.type === 'file_manager' && (
              <div className="space-y-4">
                {/* Drag and drop target */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    isDraggingFile
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">
                    Drag and drop incident reports, audio notes, or photos here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Files are encrypted prior to local storage and sync
                  </p>
                </div>

                {/* Uploaded files list */}
                <div className="space-y-2">
                  {droppedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#0c0d12] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Widget 4: Automated Reporting & Analytics Heatmap */}
            {widget.type === 'viral_radar' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/5 space-y-2">
                    <span className="text-xs text-slate-400 font-mono">PEAK ENGAGEMENT HOUR</span>
                    <h4 className="text-xl font-bold text-white font-mono">11:00 PM – 02:00 AM</h4>
                    <p className="text-[11px] text-slate-500">Post-pub lock-in browsing surge</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/5 space-y-2">
                    <span className="text-xs text-slate-400 font-mono">TOP VIRAL TOPIC</span>
                    <h4 className="text-xl font-bold text-amber-400">Stag Do Inflatables</h4>
                    <p className="text-[11px] text-slate-500">98% Outrage-O-Meter saturation</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/5 space-y-2">
                    <span className="text-xs text-slate-400 font-mono">ENCRYPTED VAULT SYNC</span>
                    <h4 className="text-xl font-bold text-emerald-400 font-mono">100% HEALTH</h4>
                    <p className="text-[11px] text-slate-500">AES-256 Multi-tab broadcast channel</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300">Automated Weekly Dispatch</span>
                    <p className="text-slate-400">Reports are generated automatically every Sunday at midnight.</p>
                  </div>
                  <button
                    onClick={generateAndDownloadCSV}
                    className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-white mb-4">
              Add New Team Collaboration Task
            </h3>
            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Audit new stag do submissions for privacy"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Assignee</label>
                <input
                  type="text"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 text-slate-400 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
