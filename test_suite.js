// Comprehensive Automated Test Suite for Anonymous Student Feedback Platform
const BASE = 'http://127.0.0.1:8787';
const DEV_SECRET = 'local-dev-admin-secret-token';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- STARTING TEST SUITE ---\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'healthy', 'GET /api/health returns 200 and healthy status');

  // 2. Config check
  const cfgRes = await fetch(`${BASE}/api/config`);
  const cfgData = await cfgRes.json();
  assert(cfgRes.status === 200 && cfgData.data.turnstileSiteKey, 'GET /api/config returns Turnstile site key');

  // 3. Static asset serving (SPA entry point)
  const rootRes = await fetch(`${BASE}/`);
  const rootHtml = await rootRes.text();
  assert(rootRes.status === 200 && rootHtml.includes('StudentVoice'), 'Cloudflare Static Assets serves index.html at root');

  // 4. Input validation - Empty submission
  const emptyRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(emptyRes.status === 400, 'POST /api/feedback rejects empty body with 400');

  // 5. Input validation - Short body (< 50 chars)
  const shortRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Academics',
      body: 'Too short',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  assert(shortRes.status === 400, 'POST /api/feedback rejects short message (< 50 chars) with 400');

  // 6. Input validation - Invalid Category
  const badCatRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'FakeCategory',
      body: 'This is a valid length message that should fail because of category validation rule testing.',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  assert(badCatRes.status === 400, 'POST /api/feedback rejects invalid category with 400');

  // 7. Security - Honeypot trap
  const hpRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Academics',
      body: 'This is a valid length message that contains honeypot content to verify bot trapping mechanism.',
      turnstileToken: 'TEST_PASS_TOKEN',
      honeypot: 'bot_spam_input_value',
    }),
  });
  assert(hpRes.status === 400, 'POST /api/feedback rejects honeypot bot trap with 400');

  // 8. Privacy Protection - PII Detection (Email)
  const piiEmailRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Academics',
      title: 'Email PII Test',
      body: 'I am a student and my email address is john.doe2024@university.edu please contact me.',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  const piiEmailData = await piiEmailRes.json();
  assert(piiEmailRes.status === 400 && piiEmailData.error.includes('identifying'), 'POST /api/feedback detects and blocks email PII');

  // 9. Privacy Protection - PII Detection (Phone Number)
  const piiPhoneRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Administration',
      title: 'Phone PII Test',
      body: 'Please call the admin desk directly at +1-800-555-0199 or 9876543210 regarding the refund.',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  assert(piiPhoneRes.status === 400, 'POST /api/feedback detects and blocks phone number PII');

  // 10. Privacy Protection - PII Detection (Roll number / Student ID)
  const piiRollRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Examinations',
      title: 'Roll Number PII Test',
      body: 'My enrollment record is Roll No: 21BCE1042 and the exam schedule conflicts with my practicals.',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  assert(piiRollRes.status === 400, 'POST /api/feedback detects and blocks roll/student ID number PII');

  // 11. Valid Submission
  const validSubmissionRes = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Infrastructure',
      title: 'Library quiet study hours need expansion during midterms',
      body: 'During midterm and finals weeks, the science library is completely packed after 8 PM. Extending access hours until midnight with security staff present would make a huge difference for students commuting from off-campus.',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  const validSubData = await validSubmissionRes.json();
  assert(validSubmissionRes.status === 201 && validSubData.data.status === 'pending', 'POST /api/feedback successfully accepts clean submission and sets status to pending');
  const createdFeedbackId = validSubData.data.id;

  // 12. Public Feed Privacy check: Pending submission MUST NOT appear publicly!
  const publicFeedRes1 = await fetch(`${BASE}/api/feedback`);
  const publicFeedData1 = await publicFeedRes1.json();
  const foundPendingInFeed = publicFeedData1.data.items.some((item) => item.id === createdFeedbackId);
  assert(!foundPendingInFeed, 'Public feed does NOT display pending submissions (anonymity & moderation quarantine enforced)');

  // 13. Admin Security - Unauthorized Access
  const adminUnauthRes = await fetch(`${BASE}/api/admin/stats`);
  assert(adminUnauthRes.status === 401, 'GET /api/admin/stats returns 401 Unauthorized without admin credentials');

  // 14. Admin Security - Authorized Access
  const adminAuthRes = await fetch(`${BASE}/api/admin/stats`, {
    headers: { 'x-admin-dev-secret': DEV_SECRET },
  });
  const adminStats = await adminAuthRes.json();
  assert(adminAuthRes.status === 200 && adminStats.data.pending >= 1, 'GET /api/admin/stats returns 200 with authorized dev secret, pending count >= 1');

  // 15. Admin Moderation Queue - View pending items
  const adminQueueRes = await fetch(`${BASE}/api/admin/feedback?status=pending`, {
    headers: { 'x-admin-dev-secret': DEV_SECRET },
  });
  const adminQueueData = await adminQueueRes.json();
  const queueItem = adminQueueData.data.items.find((i) => i.id === createdFeedbackId);
  assert(queueItem !== undefined, 'Admin moderation queue displays the pending feedback item');

  // 16. Admin Moderation Action - Approve feedback
  const approveRes = await fetch(`${BASE}/api/admin/feedback/${createdFeedbackId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-dev-secret': DEV_SECRET,
    },
    body: JSON.stringify({ status: 'approved' }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.status === 200 && approveData.data.status === 'approved', 'PATCH /api/admin/feedback/:id/status approves submission');

  // 17. Admin Audit Log Verification
  const auditRes = await fetch(`${BASE}/api/admin/audit-logs`, {
    headers: { 'x-admin-dev-secret': DEV_SECRET },
  });
  const auditLogs = await auditRes.json();
  const foundLog = auditLogs.data.some((l) => l.feedback_id === createdFeedbackId && l.action === 'status_change_to_approved');
  assert(foundLog, 'Admin audit log records status change action and timestamp');

  // 18. Public Feed Verification - Approved item is now visible
  const publicFeedRes2 = await fetch(`${BASE}/api/feedback`);
  const publicFeedData2 = await publicFeedRes2.json();
  const foundApprovedInFeed = publicFeedData2.data.items.find((item) => item.id === createdFeedbackId);
  assert(foundApprovedInFeed !== undefined, 'Approved feedback now appears in public feed');

  // 19. Anonymity verification in API response: No IP, email, or student identity leaked!
  if (foundApprovedInFeed) {
    const leakedIp = 'ip' in foundApprovedInFeed;
    const leakedEmail = 'email' in foundApprovedInFeed;
    const leakedUser = 'user_id' in foundApprovedInFeed;
    assert(!leakedIp && !leakedEmail && !leakedUser, 'Published feedback record leaks ZERO IP, email, or user identifiers');
  }

  // 20. Category Filtering on Public Feed
  const catFilterRes = await fetch(`${BASE}/api/feedback?category=Infrastructure`);
  const catFilterData = await catFilterRes.json();
  assert(catFilterData.data.items.every((i) => i.category === 'Infrastructure'), 'GET /api/feedback?category=Infrastructure filters items accurately');

  // 21. Single Item Fetch: GET /api/feedback/:id
  const singleItemRes = await fetch(`${BASE}/api/feedback/${createdFeedbackId}`);
  const singleItemData = await singleItemRes.json();
  assert(singleItemRes.status === 200 && singleItemData.data.id === createdFeedbackId, 'GET /api/feedback/:id returns single approved item');

  // 22. Report Feedback: POST /api/feedback/:id/report
  const reportRes = await fetch(`${BASE}/api/feedback/${createdFeedbackId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: 'personal_information',
      details: 'Automated test report submission',
      turnstileToken: 'TEST_PASS_TOKEN',
    }),
  });
  assert(reportRes.status === 201, 'POST /api/feedback/:id/report accepts user report');

  // 23. Admin Reports Queue
  const adminReportsRes = await fetch(`${BASE}/api/admin/reports`, {
    headers: { 'x-admin-dev-secret': DEV_SECRET },
  });
  const adminReportsData = await adminReportsRes.json();
  const createdReport = adminReportsData.data.items.find((r) => r.feedback_id === createdFeedbackId);
  assert(createdReport !== undefined && createdReport.feedback_preview !== undefined, 'Admin reports queue includes report with feedback preview');

  // 24. Admin Review Report
  if (createdReport) {
    const reportReviewRes = await fetch(`${BASE}/api/admin/reports/${createdReport.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-dev-secret': DEV_SECRET,
      },
      body: JSON.stringify({ status: 'reviewed' }),
    });
    assert(reportReviewRes.status === 200, 'PATCH /api/admin/reports/:id marks report as reviewed');
  }

  // 25. Admin Hide Feedback
  const hideRes = await fetch(`${BASE}/api/admin/feedback/${createdFeedbackId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-dev-secret': DEV_SECRET,
    },
    body: JSON.stringify({ status: 'hidden' }),
  });
  assert(hideRes.status === 200, 'Admin can hide published feedback');

  // Verify hidden from public feed
  const publicFeedRes3 = await fetch(`${BASE}/api/feedback`);
  const publicFeedData3 = await publicFeedRes3.json();
  const foundHiddenInFeed = publicFeedData3.data.items.some((item) => item.id === createdFeedbackId);
  assert(!foundHiddenInFeed, 'Hidden feedback no longer appears in public feed');

  // 26. Admin Permanent Deletion
  const deleteRes = await fetch(`${BASE}/api/admin/feedback/${createdFeedbackId}`, {
    method: 'DELETE',
    headers: { 'x-admin-dev-secret': DEV_SECRET },
  });
  assert(deleteRes.status === 200, 'DELETE /api/admin/feedback/:id permanently removes record');

  // Verify deleted item returns 404
  const deletedFetchRes = await fetch(`${BASE}/api/feedback/${createdFeedbackId}`);
  assert(deletedFetchRes.status === 404, 'Deleted feedback returns 404 on subsequent requests');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
