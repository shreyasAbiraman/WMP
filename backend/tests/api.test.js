import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { TrustedContact } from '../src/models/TrustedContact.js';
import { EmergencyIncident } from '../src/models/EmergencyIncident.js';
import { Journey } from '../src/models/Journey.js';

let authToken = '';
let testUserId = '';
let testContactId = '';
let testIncidentId = '';
let testJourneyId = '';
const testEmail = `testuser_${Date.now()}@example.com`;

beforeAll(async () => {
  await connectDB();
  await User.deleteOne({ email: testEmail });
});

afterAll(async () => {
  if (testUserId) {
    await Promise.all([
      User.findByIdAndDelete(testUserId),
      TrustedContact.deleteMany({ userId: testUserId }),
      EmergencyIncident.deleteMany({ userId: testUserId }),
      Journey.deleteMany({ userId: testUserId }),
    ]);
  }
  await mongoose.connection.close();
});

describe('1. System Health API', () => {
  it('GET /api/v1/health should return 200 with operational status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});

describe('2. Authentication & User Flow', () => {
  it('POST /api/v1/auth/register fails with invalid password match', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Test User',
      email: testEmail,
      phoneNumber: '+919876543210',
      password: 'StrongPassword123!',
      confirmPassword: 'MismatchPassword!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register successfully registers new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Priya Sharma',
      email: testEmail,
      phoneNumber: '+919876543210',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.passwordHash).toBeUndefined();

    authToken = res.body.data.accessToken;
    testUserId = res.body.data.user._id;
  });

  it('POST /api/v1/auth/login succeeds with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'SecurePassword123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('GET /api/v1/auth/me returns current user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.fullName).toBe('Priya Sharma');
  });

  it('GET /api/v1/auth/me rejects unauthorized request without token (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('3. Trusted Contacts System', () => {
  it('POST /api/v1/contacts adds a new trusted contact', async () => {
    const res = await request(app)
      .post('/api/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Aarav Sharma',
        relationship: 'sibling',
        phoneNumber: '+919876543211',
        email: 'aarav@example.com',
        preferredNotifyMethod: 'sms',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.contact.name).toBe('Aarav Sharma');
    testContactId = res.body.data.contact._id;
  });

  it('GET /api/v1/contacts retrieves user contacts list', async () => {
    const res = await request(app)
      .get('/api/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contacts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('4. SOS Emergency System', () => {
  it('POST /api/v1/emergencies triggers SOS and persists incident', async () => {
    const res = await request(app)
      .post('/api/v1/emergencies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        incidentType: 'sos_button',
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 12,
        address: 'Mumbai Central Area',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incident.incidentId).toBeDefined();
    expect(res.body.data.incident.status).toBe('active');
    testIncidentId = res.body.data.incident._id;
  });

  it('Duplicate SOS trigger returns existing active incident without recreating', async () => {
    const res = await request(app)
      .post('/api/v1/emergencies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        incidentType: 'sos_button',
        latitude: 19.0765,
        longitude: 72.878,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isDuplicate).toBe(true);
    expect(res.body.data.incident._id).toBe(testIncidentId);
  });

  it('PATCH /api/v1/emergencies/:id/resolve resolves the active emergency', async () => {
    const res = await request(app)
      .patch(`/api/v1/emergencies/${testIncidentId}/resolve`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resolutionNotes: 'Safe at home with family',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.incident.status).toBe('resolved');
  });
});

describe('5. Safe Journey Mode', () => {
  it('POST /api/v1/journeys starts a safe journey', async () => {
    const res = await request(app)
      .post('/api/v1/journeys')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        destination: {
          name: 'Home',
          address: '221B Baker Street',
          latitude: 19.08,
          longitude: 72.88,
        },
        expectedDurationMinutes: 30,
        checkInIntervalMinutes: 10,
        selectedContacts: testContactId ? [testContactId] : [],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.journey.status).toBe('active');
    testJourneyId = res.body.data.journey._id;
  });

  it('PATCH /api/v1/journeys/:id/check-in logs safe check-in', async () => {
    const res = await request(app)
      .patch(`/api/v1/journeys/${testJourneyId}/check-in`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        latitude: 19.077,
        longitude: 72.879,
        note: 'Halfway there, all good',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.journey.checkInHistory.length).toBeGreaterThanOrEqual(2);
  });

  it('PATCH /api/v1/journeys/:id/complete finishes the journey', async () => {
    const res = await request(app)
      .patch(`/api/v1/journeys/${testJourneyId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.journey.status).toBe('completed');
  });
});

describe('6. AI Safety Assistant', () => {
  it('POST /api/v1/assistant/chat returns actionable guidance for stalking question', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        prompt: 'What should I do if someone is following me?',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toContain('following');
    expect(res.body.data.source).toBe('safety_knowledge_engine');
  });
});
