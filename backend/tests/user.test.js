const User = require('../src/models/User');

describe('User Model', () => {
  test('should calculate BMI correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      profile: {
        height: 170, // cm
        weight: 70   // kg
      }
    };

    const user = new User(userData);
    await user.save();

    // BMI = weight(kg) / height(m)^2
    // Expected: 70 / (1.7)^2 = 24.2
    expect(user.profile.bmi).toBe(24.2);
  });

  test('should hash password before saving', async () => {
    const userData = {
      email: 'test2@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();

    expect(user.password).not.toBe('password123');
    expect(user.password.length).toBeGreaterThan(20);
  });

  test('should compare passwords correctly', async () => {
    const userData = {
      email: 'test3@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    const isNotMatch = await user.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});