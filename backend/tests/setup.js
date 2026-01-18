const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

// Setup test database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  await mongoose.connect(mongoUri)
})

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany()
  }
})

// Close database connection after all tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})
