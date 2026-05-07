const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects (Admin: all, Member: projects they're in)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'Admin') {
      query = Project.find();
    } else {
      query = Project.find({ members: req.user._id });
    }

    const projects = await query
      .populate('admin', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project.' });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required.' });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      admin: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'admin', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json({ message: 'Project created successfully!', project: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating project.' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (title) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (members) project.members = members;

    await project.save();

    const populated = await project.populate([
      { path: 'admin', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json({ message: 'Project updated successfully!', project: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating project.' });
  }
};

// @desc    Delete a project (and its tasks)
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Delete all tasks under this project
    await Task.deleteMany({ project: req.params.id });

    await project.deleteOne();

    res.json({ message: 'Project and all its tasks deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project.' });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
