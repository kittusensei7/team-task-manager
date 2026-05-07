import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import { Plus, FolderOpen, Search, Loader2, RefreshCw } from 'lucide-react';

const EMPTY_FORM = { title: '', description: '', members: [] };

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, uRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/users'),
      ]);
      setProjects(pRes.data.projects || []);
      setAllUsers(uRes.data.users || []);
    } catch {
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditProject(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      members: project.members?.map((m) => m._id) || [],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProject(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Project title is required.');
    try {
      setSaving(true);
      if (editProject) {
        const { data } = await api.put(`/projects/${editProject._id}`, form);
        setProjects((prev) => prev.map((p) => p._id === editProject._id ? data.project : p));
        toast.success('Project updated!');
      } else {
        const { data } = await api.post('/projects', form);
        setProjects((prev) => [data.project, ...prev]);
        toast.success('Project created!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project.');
    }
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary-400" />
            Projects
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-dark-700/50 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input pl-10"
        />
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">
            {search ? 'No projects match your search.' : 'No projects yet.'}
          </p>
          {isAdmin && !search && (
            <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={openEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editProject ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Project title"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the project (optional)"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Team Members
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({form.members.length} selected)
              </span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allUsers.map((user) => (
                <label
                  key={user._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.members.includes(user._id)
                      ? 'bg-primary-500/10 border-primary-500/30'
                      : 'bg-dark-700/30 border-white/5 hover:border-white/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="accent-primary-500"
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email} · {user.role}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editProject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
