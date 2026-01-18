const bcrypt = require('bcryptjs')

const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User'
}

const validTask = {
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'medium'
}

const validCategory = {
  name: 'Test Category',
  description: 'Test category description',
  color: '#3b82f6'
}

const createHashedPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

module.exports = {
  validUser,
  validTask,
  validCategory,
  createHashedPassword
}
