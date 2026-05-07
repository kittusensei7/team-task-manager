import { Users, Pencil, Trash2, FolderOpen } from 'lucide-react';

export default function ProjectCard({ project, onEdit, onDelete, isAdmin }) {
  return (
    <div className="card group hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate">{project.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Admin: {project.admin?.name || 'Unknown'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              title="Edit project"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Members */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((member, i) => (
              <div
                key={member._id || i}
                className="w-7 h-7 rounded-full border-2 border-dark-800 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center"
                title={member.name}
              >
                <span className="text-white text-xs font-bold">
                  {member.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
            {project.members?.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-dark-800 bg-dark-600 flex items-center justify-center">
                <span className="text-gray-300 text-xs font-bold">+{project.members.length - 4}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs text-gray-600">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
