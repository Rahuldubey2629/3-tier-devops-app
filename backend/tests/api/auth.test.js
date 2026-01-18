const request = require('supertest')
const express = require('express')
const User = require('../../models/User.model')
const authRoutes = require('../../routes/auth.routes')
const { validUser } = require('../helpers/testData')

require('../setup')

const app = express()
app.use(express.json())
app.use('/api/v1/auth', authRoutes)

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toHaveProperty('_id')
      expect(response.body.data.user.email).toBe(validUser.email)
      expect(response.body.data.user.username).toBe(validUser.username)
      expect(response.body.data.user).not.toHaveProperty('password')
      expect(response.body.data).toHaveProperty('token')
    })

    it('should fail with duplicate username', async () => {
      await User.create(validUser)

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('already exists')
    })

    it('should fail with invalid email', async () => {
      const invalidUser = { ...validUser, email: 'invalid-email' }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'test' })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create(validUser)
    })

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user.email).toBe(validUser.email)
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid credentials')
    })

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: validUser.password
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail without email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: validUser.password
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/auth/me', () => {
    let token

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser)

      token = response.body.data.token
    })

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe(validUser.email)
      expect(response.body.data).not.toHaveProperty('password')
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    let token

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser)

      token = response.body.data.token
    })

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logout successful')
    })
  })
})
