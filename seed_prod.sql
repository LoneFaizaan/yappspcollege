-- Production Seed Data for yappspcollege
UPDATE feedback SET status = 'approved', published_at = 1795239590000 WHERE id = '74abdab0-285c-45de-80fe-692e8800e83a';

INSERT INTO feedback (id, title, body, category, status, created_at, published_at, updated_at) VALUES 
(
  '9a81b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  'Library quiet study zones need functional power outlets on the 3rd floor',
  'Almost half of the power sockets along the window desks in the 3rd-floor study zone are dead. With coursework requiring laptops and tablets, having these fixed before midterms would make a huge difference for students commuting from off-campus.',
  'Campus Facilities',
  'approved',
  1795238000000,
  1795238050000,
  1795238050000
),
(
  '8b7c6d5e-4f3a-2b1c-0d9e-8f7a6b5c4d3e',
  'Computer Science syllabus needs modern version control and cloud architecture focus',
  'The current CS curriculum spends almost two months on legacy command-line tools from the 1990s, but barely covers modern Git collaborative workflows, CI/CD pipelines, or deploying to cloud edge networks. Integrating hands-on labs with modern tooling will prepare students much better for software internships.',
  'Academics',
  'approved',
  1795237000000,
  1795237100000,
  1795237100000
),
(
  '7c6d5e4f-3a2b-1c0d-9e8f-7a6b5c4d3e2f',
  'Financial aid and scholarship renewal statuses should be trackable online',
  'Currently, students have to stand in physical queues at the bursar window during narrow 2-hour morning slots just to check if their scholarship or fee waiver was processed. A simple status update on the student portal noticeboard would save hours for working students.',
  'Student Services',
  'approved',
  1795236000000,
  1795236200000,
  1795236200000
),
(
  '6d5e4f3a-2b1c-0d9e-8f7a-6b5c4d3e2f1a',
  'Commending the Physics department interactive lab previews this semester',
  'A quick positive note: introducing short interactive simulation modules before each physical experiment has made mechanics and optics labs significantly clearer. The lab assistants have been patient, approachable, and encouraging.',
  'Faculty & Teaching',
  'approved',
  1795235000000,
  1795235300000,
  1795235300000
),
(
  '5e4f3a2b-1c0d-9e8f-7a6b-5c4d3e2f1a0b',
  'Exam timetable elective scheduling conflict for dual majors',
  'The draft semester exam timetable currently schedules the Advanced Data Structures exam and the Microeconomics elective on the exact same morning slot. Please ensure the examination committee adjusts the elective slot before finalizing.',
  'Examinations',
  'approved',
  1795234000000,
  1795234200000,
  1795234200000
),
(
  '4f3a2b1c-0d9e-8f7a-6b5c-4d3e2f1a0b9c',
  'Introduce a peer tutoring desk in the student center for introductory STEM courses',
  'Many first-year engineering and science students struggle with calculus and linear algebra fundamentals. Setting up an informal peer tutoring desk in the student center staffed by upper-year volunteers during evening hours would dramatically improve student confidence and retention.',
  'Suggestions',
  'approved',
  1795233000000,
  1795233400000,
  1795233400000
);
