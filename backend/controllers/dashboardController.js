const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    // Members see only their tasks
    if (req.user.role === 'Member') {
      taskFilter.assignedTo = req.user._id;
    }

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      recentTasks,
      totalProjects,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'Todo' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'Completed' },
        dueDate: { $lt: now },
      }),
      Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('project', 'title')
        .populate('assignedTo', 'name email'),
      req.user.role === 'Admin'
        ? Project.countDocuments()
        : Project.countDocuments({ members: req.user._id }),
    ]);

    // High priority pending tasks
    const highPriorityPending = await Task.countDocuments({
      ...taskFilter,
      priority: 'High',
      status: { $ne: 'Completed' },
    });

    res.json({
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        highPriorityPending,
        totalProjects,
      },
      recentTasks,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};

module.exports = { getDashboardStats };
