import request from 'supertest';
import { createApp } from "../src/app.js";

const app = createApp();

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
  role:"technician",
  phoneNumber: "091199287234",
  deviceId: "test-device"
};

describe('Auth Flow - Simple Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201); // HTTP 201 Created

      // Check response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');

      // Check user data
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.fullName).toBe(testUser.fullName);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be exposed

      // Check token exists
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should fail to register with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400); // HTTP 400 Bad Request

      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should fail with missing required fields', async () => {
      // Missing email
      await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          fullName: 'Test User',
        })
        .expect(500); // Will fail due to database constraint

      // Missing password
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          fullName: 'Test User',
        })
        .expect(500);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200); // HTTP 200 OK

      // Check response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');

      // Check user data matches
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.fullName).toBe(testUser.fullName);

      // Verify token is present
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401); // HTTP 401 Unauthorized

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail login with missing credentials', async () => {
      // Missing email
      await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(500);

      // Missing password
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(500);
    });
  });

  describe('Complete Auth Flow', () => {
    it('should allow user to register and then login', async () => {
      const newUser = {
        email: 'flowtest@example.com',
        password: 'flowpassword123',
        fullName: 'Flow Test User',
      };

      // Step 1: Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      const registerToken = registerResponse.body.token;
      expect(registerToken).toBeTruthy();

      // Step 2: Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      const loginToken = loginResponse.body.token;
      expect(loginToken).toBeTruthy();

      // Both tokens should be valid JWT tokens
      expect(registerToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);
      expect(loginToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);

      // User data should be consistent
      expect(registerResponse.body.user.id).toBe(loginResponse.body.user.id);
      expect(registerResponse.body.user.email).toBe(loginResponse.body.user.email);
    });
  });
});