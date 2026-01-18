const User = require('../../models/User.model')
const { validUser } = require('../helpers/testData')

require('../setup')

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user successfully', async () => {
      const user = await User.create(validUser)
      
      expect(user._id).toBeDefined()
      expect(user.username).toBe(validUser.username)
      expect(user.email).toBe(validUser.email)
      expect(user.firstName).toBe(validUser.firstName)
      expect(user.lastName).toBe(validUser.lastName)
      expect(user.role).toBe('user')
      expect(user.isActive).toBe(true)
    })

    it('should hash password before saving', async () => {
      const user = await User.create(validUser)
      
      expect(user.password).toBeDefined()
      expect(user.password).not.toBe(validUser.password)
      expect(user.password.length).toBeGreaterThan(20)
    })

    it('should fail without required fields', async () => {
      const userWithoutUsername = new User({
        email: 'test@example.com',
        password: 'Test123!'
      })

      await expect(userWithoutUsername.save()).rejects.toThrow()
    })

    it('should fail with duplicate username', async () => {
      await User.create(validUser)
      
      await expect(User.create(validUser)).rejects.toThrow()
    })

    it('should fail with duplicate email', async () => {
      await User.create(validUser)
      
      const duplicateEmail = {
        ...validUser,
        username: 'different'
      }
      
      await expect(User.create(duplicateEmail)).rejects.toThrow()
    })

    it('should fail with invalid email format', async () => {
      const invalidUser = {
        ...validUser,
        email: 'invalid-email'
      }
      
      await expect(User.create(invalidUser)).rejects.toThrow()
    })
  })

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const user = await User.create(validUser)
      const isMatch = await user.comparePassword(validUser.password)
      
      expect(isMatch).toBe(true)
    })

    it('should reject invalid password', async () => {
      const user = await User.create(validUser)
      const isMatch = await user.comparePassword('WrongPassword123!')
      
      expect(isMatch).toBe(false)
    })
  })

  describe('User Schema Defaults', () => {
    it('should set default role to user', async () => {
      const user = await User.create(validUser)
      
      expect(user.role).toBe('user')
    })

    it('should set isActive to true by default', async () => {
      const user = await User.create(validUser)
      
      expect(user.isActive).toBe(true)
    })
  })
})
