const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks (Admin: all tasks or filter; Member: their tasks)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let filter = {};

    if (req.user.role === 'Member') {
      filter.assignedTo = req.user._id;
    }

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks.' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (Admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: 'Title, project, assignedTo, and dueDate are required.',
      });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      project,
      assignedTo,
      createdBy: req.user._id,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
    });

    const populated = await task.populate([
      { path: 'project', select: 'title' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({ message: 'Task created successfully!', task: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating task.' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Admin: all fields; Member: status only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Members can only update status
    if (req.user.role === 'Member') {
      // Members can only update tasks assigned to them
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own tasks.' });
      }

      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({ message: 'Members can only update task status.' });
      }
    } else {
      // Admin can update all fields
      const { title, description, assignedTo, status, priority, dueDate, project } = req.body;
      if (title) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (assignedTo) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = new Date(dueDate);
      if (project) task.project = project;
    }

    await task.save();

    const populated = await task.populate([
      { path: 'project', select: 'title' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json({ message: 'Task updated successfully!', task: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating task.' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
