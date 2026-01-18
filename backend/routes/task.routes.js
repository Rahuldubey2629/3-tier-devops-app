const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Validation rules
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

router.route('/stats').get(getTaskStats);
router.route('/').get(getTasks).post(taskValidation, createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.route('/:id/comments').post(addComment);

module.exports = router;
