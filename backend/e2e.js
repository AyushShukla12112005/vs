import assert from 'assert';

const tryFetch = async (url, opts = {}) => {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

const findBase = async () => {
  for (const port of [5000, 5001, 5002]) {
    const url = `http://localhost:${port}/api/health`;
    const r = await tryFetch(url);
    if (r.ok) return `http://localhost:${port}`;
  }
  throw new Error('No backend responded on ports 5000/5001/5002');
};

const run = async () => {
  console.log('E2E: probing backend...');
  const base = await findBase();
  console.log('E2E: backend found at', base);

  const unique = Date.now();
  const u1 = { name: 'Test User A', email: `e2e-a+${unique}@example.com`, password: 'password' };
  const u2 = { name: 'Test User B', email: `e2e-b+${unique}@example.com`, password: 'password' };

  console.log('Registering two users...');
  const r1 = await tryFetch(`${base}/api/auth/register`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(u1) });
  const r2 = await tryFetch(`${base}/api/auth/register`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(u2) });
  console.log('Register results:', r1.status, r1.data?.message || r1.data, ' | ', r2.status, r2.data?.message || r2.data);

  const login1 = await tryFetch(`${base}/api/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: u1.email, password: u1.password }) });
  const login2 = await tryFetch(`${base}/api/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: u2.email, password: u2.password }) });
  assert(login1.ok && login1.data.token, 'login1 failed');
  assert(login2.ok && login2.data.token, 'login2 failed');
  const token1 = login1.data.token;
  const token2 = login2.data.token;
  console.log('Logged in both users; tokens acquired.');

  // Create project as user1
  const projectPayload = { name: 'E2E Project ' + unique, description: 'Test project' };
  const projectRes = await tryFetch(`${base}/api/projects`, { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token1}`}, body: JSON.stringify(projectPayload) });
  assert(projectRes.ok, 'create project failed: ' + JSON.stringify(projectRes));
  const project = projectRes.data;
  console.log('Project created:', project._id);

  // Invite user2
  const inviteRes = await tryFetch(`${base}/api/projects/${project._id}/invite`, { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token1}`}, body: JSON.stringify({ userId: login2.data.user._id }) });
  assert(inviteRes.ok, 'invite failed: ' + JSON.stringify(inviteRes));
  console.log('User invited; members:', inviteRes.data.members.map(m => m.email));

  // Create issue assigned to user2
  const issuePayload = { project: project._id, title: 'E2E Issue', description: 'This is a test', type: 'bug', priority: 'high', assignee: login2.data.user._id };
  const createIssue = await tryFetch(`${base}/api/issues`, { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token1}`}, body: JSON.stringify(issuePayload) });
  assert(createIssue.ok, 'create issue failed: ' + JSON.stringify(createIssue));
  const issue = createIssue.data;
  console.log('Issue created:', issue._id, 'assignee:', issue.assignee?.email || issue.assignee);

  // Get issues for project
  const list = await tryFetch(`${base}/api/issues?projectId=${project._id}`, { headers: {'authorization': `Bearer ${token1}`} });
  assert(list.ok, 'list issues failed');
  console.log('Issues count:', list.data.length);

  // Update issue status to in_progress
  const upd = await tryFetch(`${base}/api/issues/${issue._id}/reorder`, { method: 'PATCH', headers: {'content-type':'application/json', 'authorization': `Bearer ${token1}`}, body: JSON.stringify({ status: 'in_progress' }) });
  assert(upd.ok, 'update status failed');
  console.log('Issue updated status ->', upd.data.status);

  // Post comment as user2
  const commentRes = await tryFetch(`${base}/api/comments`, { method: 'POST', headers: {'content-type':'application/json', 'authorization': `Bearer ${token2}`}, body: JSON.stringify({ issue: issue._id, content: 'Hello from user2' }) });
  assert(commentRes.ok, 'post comment failed');
  console.log('Comment posted:', commentRes.data._id);

  // Get comments
  const commentsList = await tryFetch(`${base}/api/comments/issue/${issue._id}`, { headers: {'authorization': `Bearer ${token1}`} });
  assert(commentsList.ok, 'get comments failed');
  console.log('Comments count:', commentsList.data.length);

  // Attempt delete issue as user2 (should fail)
  const delAsUser2 = await tryFetch(`${base}/api/issues/${issue._id}`, { method: 'DELETE', headers: {'authorization': `Bearer ${token2}`} });
  console.log('Delete as user2 status:', delAsUser2.status, delAsUser2.data?.message || delAsUser2.data);

  // Delete as user1 (should succeed)
  const delAsUser1 = await tryFetch(`${base}/api/issues/${issue._id}`, { method: 'DELETE', headers: {'authorization': `Bearer ${token1}`} });
  console.log('Delete as user1 status:', delAsUser1.status, delAsUser1.data?.message || delAsUser1.data);

  console.log('\nE2E completed successfully.');
};

run().catch((err) => { console.error('E2E failed:', err.message); process.exit(2); });
