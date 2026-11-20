// Seed realistic student feedback data for local testing and demonstration
const BASE = 'http://127.0.0.1:8787';
const DEV_SECRET = 'local-dev-admin-secret-token';

const sampleFeedback = [
  {
    category: 'Academics',
    title: 'Computer Science syllabus needs more focus on modern Git workflows and cloud architecture',
    body: 'The current CS curriculum spends almost 8 weeks on legacy tools, but barely touches Git version control, CI/CD, or deploying applications to cloud providers. Adding practical workshops on collaborative coding would help prepare students significantly better for industry internships.',
  },
  {
    category: 'Campus Facilities',
    title: 'Central Library power outlets are broken on the 3rd floor study pods',
    body: 'Almost half of the power sockets along the window desks on the 3rd floor quiet zone are no longer functional. With laptops and tablets required for coursework, having working surge-protected outlets restored before final exam week would be a huge help.',
  },
  {
    category: 'Student Services',
    title: 'Financial aid and scholarship application status should be trackable online',
    body: 'Currently, the only way to know if departmental fee waivers or merit scholarship renewals have been processed is to visit the bursar window during narrow 2-hour morning queues. Having a simple status indicator on the student noticeboard would save hours for working students.',
  },
  {
    category: 'Faculty & Teaching',
    title: 'Appreciation for the Physics department interactive lab demonstrations this semester',
    body: 'A quick positive note: the introduction of short digital simulation previews before each lab has made mechanics and optics experiments far easier to understand. The lab assistants have been attentive and approachable.',
  },
  {
    category: 'Administration',
    title: 'Exam schedule published with overlapping elective courses for dual majors',
    body: 'The preliminary semester exam timetable currently schedules Data Structures and Microeconomics on the exact same morning slot. Please ensure the examination committee adjusts elective slots before finalizing the dates.',
  },
  {
    category: 'Suggestions',
    title: 'Introduce peer tutoring desk in the student center for introductory calculus',
    body: 'Many first-year engineering and business students struggle with Calculus I. Setting up an informal peer tutoring desk in the student lounge staffed by upperclassmen during evening hours would dramatically improve pass rates.',
  },
];

async function seed() {
  console.log('Seeding initial demonstration feedback items...');

  for (const item of sampleFeedback) {
    // 1. Submit as pending
    const subRes = await fetch(`${BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...item,
        turnstileToken: 'TEST_PASS_TOKEN',
      }),
    });
    const subData = await subRes.json();

    if (subData?.data?.id) {
      // 2. Approve via admin API
      await fetch(`${BASE}/api/admin/feedback/${subData.data.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-dev-secret': DEV_SECRET,
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      console.log(`✓ Seeded & Approved: "${item.title}"`);
    }
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
