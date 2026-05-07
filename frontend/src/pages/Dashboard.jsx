import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  CheckSquare, Clock, AlertTriangle, FolderOpen,
  TrendingUp, Zap, ArrowRight, CalendarDays, User
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card flex items-center gap-4 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.stats);
      setRecentTasks(data.recentTasks || []);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: CheckSquare, label: 'Total Tasks', value: stats?.totalTasks || 0, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Clock, label: 'In Progress', value: stats?.inProgressTasks || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: TrendingUp, label: 'Completed', value: stats?.completedTasks || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: AlertTriangle, label: 'Overdue', value: stats?.overdueTasks || 0, color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: FolderOpen, label: 'Projects', value: stats?.totalProjects || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Zap, label: 'High Priority', value: stats?.highPriorityPending || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  // Progress bar calculation
  const total = stats?.totalTasks || 0;
  const completedPct = total > 0 ? Math.round((stats.completedTasks / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((stats.inProgressTasks / total) * 100) : 0;
  const todoPct = total > 0 ? Math.round((stats.todoTasks / total) * 100) : 0;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span>!
          </h1>
        </div>
        <p className="text-gray-400 ml-11">
          {isAdmin ? "Here's your team's overview" : "Here's your task overview"} for{' '}
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Progress + Recent Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            Task Progress
          </h2>
          {total === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No tasks yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Completion</span>
                  <span className="text-white font-medium">{completedPct}%</span>
                </div>
                <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${completedPct}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              {[
                { label: 'Todo', value: stats?.todoTasks || 0, pct: todoPct, color: 'bg-gray-500' },
                { label: 'In Progress', value: stats?.inProgressTasks || 0, pct: inProgressPct, color: 'bg-blue-500' },
                { label: 'Completed', value: stats?.completedTasks || 0, pct: completedPct, color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-300">{item.value} <span className="text-gray-600">({item.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-400" />
              Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No tasks yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => {
                const dueDate = new Date(task.dueDate);
                const overdue = task.status !== 'Completed' && isPast(dueDate) && !isToday(dueDate);
                return (
                  <div
                    key={task._id}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-dark-700/40 border ${
                      overdue ? 'border-red-500/20' : 'border-white/5'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'High' ? 'bg-red-400' :
                      task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedTo?.name}
                        </span>
                        {overdue && (
                          <span className="text-xs text-red-400">· Overdue</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
