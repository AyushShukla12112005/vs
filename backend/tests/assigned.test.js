process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

const request = supertest(app);

test('assigned issues endpoint end-to-end', async (t) => {
  // Register user A
  const unique = Date.now();
  const uA = { name: 'Test A', email: `test-a+${unique}@example.com`, password: 'password' };
  const uB = { name: 'Test B', email: `test-b+${unique}@example.com`, password: 'password' };

  const rA = await request.post('/api/auth/register').send(uA).expect(201);
  const rB = await request.post('/api/auth/register').send(uB).expect(201);
  const tokenA = rA.body.token;
  const tokenB = rB.body.token;
  const idB = rB.body.user._id;

  // Create a project
  const projectRes = await request.post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Test Project' }).expect(201);
  const project = projectRes.body;

  // Invite user B
  await request.post(`/api/projects/${project._id}/invite`).set('Authorization', `Bearer ${tokenA}`).send({ userId: idB }).expect(200);

  // Create an issue assigned to B
  const issueRes = await request.post('/api/issues').set('Authorization', `Bearer ${tokenA}`).send({ project: project._id, title: 'Assigned Issue', description: 'test', type: 'bug', priority: 'high', assignee: idB }).expect(201);
  const created = issueRes.body;
  assert.equal(created.assignee, idB);

  // Query assigned issues as user B
  const assignedRes = await request.get('/api/issues/assigned').set('Authorization', `Bearer ${tokenB}`).expect(200);
  assert(assignedRes.body.issues && Array.isArray(assignedRes.body.issues));
  const found = assignedRes.body.issues.find((i) => i._id === created._id);
  assert(found, 'Created issue should be in assigned list');

  // Cleanup: disconnect mongoose
  await mongoose.disconnect();
});