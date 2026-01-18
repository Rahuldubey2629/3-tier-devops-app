const jwt = require('jsonwebtoken')
const { protect } = require('../../middleware/auth.middleware')
const User = require('../../models/User.model')
const { validUser } = require('../helpers/testData')

require('../setup')

describe('Auth Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  describe('protect middleware', () => {
    it('should fail without authorization header', async () => {
      await protect(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Not authorized')
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should fail with invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat'

      await protect(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should fail with invalid token', async () => {
      req.headers.authorization = 'Bearer invalidtoken123'

      await protect(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should succeed with valid token', async () => {
      const user = await User.create(validUser)
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      )

      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)

      expect(req.user).toBeDefined()
      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should fail with token for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const token = jwt.sign(
        { id: fakeId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      )

      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('not found')
        })
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
