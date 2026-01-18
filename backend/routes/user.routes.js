const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getUsers,
  getUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.route('/profile').get(getProfile).put(updateProfile);
router.route('/').get(authorize('admin'), getUsers);
router.route('/:id').get(getUser);

module.exports = router;
