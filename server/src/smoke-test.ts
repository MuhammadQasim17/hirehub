/**
 * HireHub API Automated Smoke Test Suite
 * Tests end-to-end functionality against http://localhost:5000/api
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// ANSI color escape codes for terminal formatting
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runStep(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ⏳ ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`${colors.green}${colors.bold}PASSED${colors.reset} (${durationMs}ms)`);
    results.push({ name, passed: true, message: 'OK', durationMs });
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${colors.red}${colors.bold}FAILED${colors.reset} (${durationMs}ms)`);
    console.log(`     ${colors.red}Error: ${msg}${colors.reset}`);
    results.push({ name, passed: false, message: msg, durationMs });
  }
}

async function runSmokeTests() {
  console.log(`\n${colors.bold}${colors.blue}═════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   HireHub Platform - Automated End-to-End Smoke Tests      ${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Target API Base: ${colors.yellow}${API_BASE_URL}${colors.reset}\n`);

  let recruiterToken = '';
  let candidateToken = '';

  // Step 1: Health check
  await runStep('1. Health check & database connection (GET /health)', async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Expected HTTP 200, received ${res.status}`);
    }
    const data = (await res.json()) as { status: string; registeredUsers?: number };
    if (data.status !== 'ok') {
      throw new Error(`Expected status 'ok', got '${data.status}'`);
    }
  });

  // Step 2: Recruiter Login
  await runStep('2. Recruiter authentication (POST /auth/login - Sarah)', async () => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah@techcorp.io',
        password: 'Password123!',
      }),
    });
    if (!res.ok) {
      throw new Error(`Login failed with HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      token: string;
      user: { role: string; email: string };
    };
    if (!data.token) {
      throw new Error('No JWT token returned');
    }
    if (data.user.role !== 'RECRUITER') {
      throw new Error(`Expected role 'RECRUITER', got '${data.user.role}'`);
    }
    recruiterToken = data.token;
  });

  // Step 3: Fetch seeded job listings
  await runStep('3. Query public job listings (GET /jobs)', async () => {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (!res.ok) {
      throw new Error(`Jobs fetch failed with HTTP ${res.status}`);
    }
    const jobs = (await res.json()) as Array<{ id: string; title: string }>;
    if (!Array.isArray(jobs)) {
      throw new Error('Response is not an array');
    }
    if (jobs.length < 6) {
      throw new Error(`Expected at least 6 seeded jobs, received ${jobs.length}`);
    }
  });

  // Step 4: Candidate Login
  await runStep('4. Candidate authentication (POST /auth/login - Jane)', async () => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane.candidate@example.com',
        password: 'Password123!',
      }),
    });
    if (!res.ok) {
      throw new Error(`Login failed with HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      token: string;
      user: { role: string; email: string };
    };
    if (!data.token) {
      throw new Error('No JWT token returned');
    }
    if (data.user.role !== 'CANDIDATE') {
      throw new Error(`Expected role 'CANDIDATE', got '${data.user.role}'`);
    }
    candidateToken = data.token;
  });

  // Step 5: Candidate applications
  await runStep('5. Fetch candidate applications (GET /applications/my)', async () => {
    if (!candidateToken) {
      throw new Error('Missing candidate auth token from step 4');
    }
    const res = await fetch(`${API_BASE_URL}/applications/my`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Applications fetch failed with HTTP ${res.status}`);
    }
    const applications = (await res.json()) as Array<{
      id: string;
      status: string;
      job?: { title: string };
    }>;
    if (!Array.isArray(applications)) {
      throw new Error('Expected array of applications');
    }
    if (applications.length < 1) {
      throw new Error('Expected at least 1 seeded application for Jane');
    }
    const hasJaneApp = applications.some(
      (a) => a.job?.title?.includes('React') || a.status === 'REVIEWED'
    );
    if (!hasJaneApp) {
      throw new Error('Seeded application for React role not found in candidate list');
    }
  });

  // Step 6: Recruiter pipeline verification
  await runStep('6. Verify recruiter pipeline (GET /applications/recruiter)', async () => {
    if (!recruiterToken) {
      throw new Error('Missing recruiter auth token from step 2');
    }
    const res = await fetch(`${API_BASE_URL}/applications/recruiter`, {
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Recruiter applications fetch failed with HTTP ${res.status}`);
    }
    const recruiterJobs = (await res.json()) as Array<{
      id: string;
      title: string;
      applications: Array<{ id: string }>;
    }>;
    if (!Array.isArray(recruiterJobs)) {
      throw new Error('Expected array of recruiter jobs');
    }
  });

  // Summary
  console.log(`\n${colors.bold}${colors.blue}─────────────────────────────────────────────────────────────${colors.reset}`);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  if (failedCount === 0) {
    console.log(
      `${colors.bold}${colors.green}🎉 ALL ${passedCount} SMOKE TESTS PASSED! HireHub is fully functional.${colors.reset}`
    );
  } else {
    console.log(
      `${colors.bold}${colors.red}❌ ${failedCount} of ${results.length} tests failed.${colors.reset}`
    );
  }
  console.log(`${colors.bold}${colors.blue}═════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

void runSmokeTests();

