const request = require('supertest');
const app = require('../src/app');

// Mock auth middleware
// אנחנו דורסים את המידלוור האמיתי כדי לא להזדקק לטוקן אמיתי
jest.mock('../src/middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  };
});

// Mock controller
// אנחנו מדמים את הקונטרולר כדי לא להפעיל את ג'מיני או את הדאטה-בייס
jest.mock('../src/controllers/chatController', () => ({
  sendMessage: jest.fn((req, res) => {
    res.status(200).json({
      reply: 'Test AI response'
    });
  }),
  getChatHistory: jest.fn((req, res) => {
    res.status(200).json([]);
  })
}));

describe('Chat API', () => {

  test('POST /api/chat/message returns AI reply', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'Hello coach'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('reply');
  });

});