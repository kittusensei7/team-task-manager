import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import { Plus, CheckSquare, Search, Filter, Loader2, RefreshCw } from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
};

const STATUS_OPTIONS = ['', 'Todo', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['', 'High', 'Medium', 'Low'];

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterProject) params.projectId = filterProject;

      const [tRes, pRes, uRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects'),
        api.get('/auth/users'),
      ]);
      setTasks(tRes.data.tasks || []);
      setProjects(pRes.data.projects || []);
      setAllUsers(uRes.data.users || []);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTask(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.project || !form.assignedTo || !form.dueDate) {
      return toast.error('Title, project, assigned member, and due date are required.');
    }
    try {
      setSaving(true);
      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, form);
        setTasks((prev) => prev.map((t) => t._id === editTask._id ? data.task : t));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', form);
        setTasks((prev) => [data.task, ...prev]);
        toast.success('Task created!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === id ? data.task : t));
      toast.success(`Status → ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterProject('');
    setSearch('');
  };

  const hasFilters = filterStatus || filterPriority || filterProject || search;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary-400" />
            {isAdmin ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-dark-700/50 border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto min-w-[130px]"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input w-auto min-w-[130px]"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {isAdmin && (
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="input w-auto min-w-[150px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckSquare className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">
            {search || hasFilters ? 'No tasks match your filters.' : 'No tasks yet.'}
          </p>
          {isAdmin && !hasFilters && (
            <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the task (optional)"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project *</label>
              <select
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="input"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assign To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="input"
              >
                <option value="">Select member</option>
                {allUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input"
              >
                {['High', 'Medium', 'Low'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                {['Todo', 'In Progress', 'Completed'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
