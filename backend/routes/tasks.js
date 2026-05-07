const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
