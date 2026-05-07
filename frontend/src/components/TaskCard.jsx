import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { Calendar, User, AlertTriangle, Clock, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

const priorityConfig = {
  High: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
};

const statusConfig = {
  Todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  'In Progress': { icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  Completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, isAdmin }) {
  const dueDate = new Date(task.dueDate);
  const isOverdue = task.status !== 'Completed' && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const daysLeft = differenceInDays(dueDate, new Date());

  const priority = priorityConfig[task.priority] || priorityConfig.Medium;
  const status = statusConfig[task.status] || statusConfig.Todo;
  const StatusIcon = status.icon;

  const statusOptions = ['Todo', 'In Progress', 'Completed'];

  return (
    <div
      className={`card group hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 ${
        isOverdue ? 'border-red-500/30 bg-red-900/5' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
            {isDueToday && task.status !== 'Completed' && (
              <span className="text-xs text-amber-400 font-medium">Due Today</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-white truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`badge border ${priority.bg} ${priority.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {task.priority}
        </span>
        <span className={`badge border ${status.bg} ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {task.status}
        </span>
        {task.project?.title && (
          <span className="badge bg-primary-500/10 border border-primary-500/20 text-primary-400">
            {task.project.title}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {task.assignedTo?.name || 'Unassigned'}
        </span>
        <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : isDueToday ? 'text-amber-400' : ''}`}>
          <Calendar className="w-3.5 h-3.5" />
          {format(dueDate, 'MMM d, yyyy')}
          {!isOverdue && !isDueToday && task.status !== 'Completed' && daysLeft > 0 && (
            <span className="text-gray-600">({daysLeft}d left)</span>
          )}
        </span>
      </div>

      {/* Status Selector */}
      <div className="flex items-center justify-between gap-3">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="flex-1 bg-dark-700/50 border border-white/10 text-gray-200 rounded-lg px-3 py-1.5 text-xs
                     focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-primary-500/10"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
