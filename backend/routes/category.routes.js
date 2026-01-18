const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 200 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Please provide a valid hex color code')
];

router.route('/').get(getCategories).post(categoryValidation, createCategory);
router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory);

module.exports = router;
