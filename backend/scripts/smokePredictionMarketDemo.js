require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

const steps = [];

async function requestJson(method, path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok || payload?.success === false) {
    const message = payload?.error || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}

async function runStep(name, action) {
  try {
    const result = await action();
    steps.push({ name, status: 'PASS' });
    console.log(`PASS ${name}`);
    return result;
  } catch (error) {
    steps.push({ name, status: 'FAIL', error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
    throw error;
  }
}

async function resolveOrConfirm({ marketId, outcome, expectedStatus }) {
  try {
    return await requestJson('POST', '/api/markets/resolve', {
      marketId,
      outcome
    });
  } catch (error) {
    if (error.message !== 'Market is not active') {
      throw error;
    }

    const detail = await requestJson('GET', `/api/markets/${marketId}`);
    const market = detail.data.market;
    if (market.status !== expectedStatus || market.outcome !== outcome) {
      throw error;
    }

    return {
      success: true,
      data: {
        market
      }
    };
  }
}

async function smoke() {
  console.log(`Prediction market smoke demo against ${API_BASE_URL}`);

  await runStep('GET /api/health', async () => {
    const health = await requestJson('GET', '/api/health');
    if (health.status !== 'OK') {
      throw new Error('Health endpoint did not return OK');
    }
  });

  await runStep('GET /api/markets/active', async () => {
    const response = await requestJson('GET', '/api/markets/active');
    const market = response.data.markets.find(item => item.marketId === '9000001');
    if (!market) {
      throw new Error('Demo active market 9000001 was not found');
    }
  });

  await runStep('GET /api/markets/9000001', async () => {
    const response = await requestJson('GET', '/api/markets/9000001');
    if (response.data.market.marketId !== '9000001') {
      throw new Error('Market detail did not return 9000001');
    }
  });

  await runStep('POST /api/markets/bet active market', async () => {
    const unique = Date.now();
    const response = await requestJson('POST', '/api/markets/bet', {
      userId: `demo-smoke-user-${unique}`,
      walletAddress: `demo-smoke-wallet-${unique}`,
      marketId: '9000001',
      marketPda: 'demo-market-pda-9000001',
      betId: `demo-smoke-bet-${unique}`,
      txSignature: `demo-smoke-bet-tx-${unique}`,
      betAmount: 10,
      betDirection: 'no',
      mintAddress: 'So11111111111111111111111111111111111111112'
    });

    if (response.data.bet.betDirection !== 'no') {
      throw new Error('Mirrored bet direction was not no');
    }
  });

  await runStep('POST /api/markets/resolve 9000002 yes', async () => {
    const response = await resolveOrConfirm({
      marketId: '9000002',
      outcome: 'yes',
      expectedStatus: 'resolved'
    });

    if (response.data.market.status !== 'resolved' || response.data.market.outcome !== 'yes') {
      throw new Error('Market 9000002 did not resolve to yes/resolved');
    }
  });

  await runStep('POST /api/markets/claim winning bet', async () => {
    const response = await requestJson('POST', '/api/markets/claim', {
      userId: 'demo-winning-user-9000002',
      walletAddress: 'demo-winning-wallet-9000002',
      marketId: '9000002',
      claimTxSignature: `demo-claim-tx-9000002-${Date.now()}`,
      payoutAmount: 35
    });

    if (response.data.bet.status !== 'settled') {
      throw new Error('Winning bet was not marked settled');
    }
  });

  await runStep('POST /api/markets/resolve 9000003 no refund', async () => {
    const response = await resolveOrConfirm({
      marketId: '9000003',
      outcome: 'no',
      expectedStatus: 'refund'
    });

    if (response.data.market.status !== 'refund' || response.data.market.outcome !== 'no') {
      throw new Error('Market 9000003 did not resolve to no/refund');
    }
  });

  await runStep('GET /api/markets/history/resolved', async () => {
    const response = await requestJson('GET', '/api/markets/history/resolved?limit=10');
    const ids = response.data.history.map(market => market.marketId);
    if (!ids.includes('9000002') || !ids.includes('9000003')) {
      throw new Error('Resolution history did not include demo resolved markets');
    }
  });

  const passed = steps.filter(step => step.status === 'PASS').length;
  console.log(`Smoke demo complete: ${passed}/${steps.length} steps passed.`);
}

smoke().catch(() => {
  console.error('Smoke demo failed. Run npm run demo:seed, start the backend, then retry.');
  process.exitCode = 1;
});
