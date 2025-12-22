const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://localhost:27017/ai-lifestyle-coach-test');
});

afterAll(async () => {
  // Clean up and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean up after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});