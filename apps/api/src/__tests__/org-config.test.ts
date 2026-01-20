import { test, describe, it } from 'node:test';
import assert from 'node:assert';

const base = 'http://localhost:3000';

const login = async (email: string, password: string) => {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  return data;
};

describe('Org Config API', () => {
  it('authenticates admin and fetches org', async () => {
    const { token, user } = await login('admin@kitabu.finance', 'admin123');
    const res = await fetch(`${base}/orgs/me`, { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(res.status, 200);
    const org = await res.json();
    assert.strictEqual(org.id, user.orgId);
  });

  it('validates update payload', async () => {
    const { token, user } = await login('admin@kitabu.finance', 'admin123');
    const res = await fetch(`${base}/orgs/${user.orgId}/config`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUtilization: -1 }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error || data.code);
  });

  it('updates maxDailySpend successfully', async () => {
    const { token, user } = await login('admin@kitabu.finance', 'admin123');
    const res = await fetch(`${base}/orgs/${user.orgId}/config`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxDailySpend: '2000000000000000000' }),
    });
    assert.strictEqual(res.status, 200);
    const org = await res.json();
    assert.strictEqual(org.config.maxDailySpend, '2000000000000000000');
  });

  it('enforces rate limiting on admin updates', async () => {
    const { token, user } = await login('admin@kitabu.finance', 'admin123');
    let lastStatus = 200;
    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${base}/orgs/${user.orgId}/config`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requireApprovalAbove: String(500000000000000000 + i) }),
      });
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    assert.strictEqual(lastStatus, 429);
  });
});
