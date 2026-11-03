export type Opportunity = {
  id: string;
  title: string;
  company: string;
  logo: string;
  tone: string;
  location: string;
  mode: 'Remote' | 'Hybrid' | 'On-site';
  kind: 'Internship' | 'Full-time' | 'Hackathon' | 'Scholarship' | 'Course';
  compensation: string;
  posted: string;
  deadline: string;
  level: string;
  category: string;
  tags: string[];
  description: string;
};

export type EventItem = {
  id: string;
  title: string;
  organizer: string;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  city: string;
  type: 'Festival' | 'Meetup' | 'Hackathon' | 'Workshop' | 'Career fair';
  attendees: number;
  color: string;
};

export const opportunities: Opportunity[] = [
  { id: 'op-1', title: 'AI & Data Science Intern', company: 'Microsoft India', logo: 'M', tone: 'blue', location: 'Hyderabad, Telangana', mode: 'Hybrid', kind: 'Internship', compensation: '₹35,000 / month', posted: '2 days ago', deadline: 'Nov 18, 2026', level: 'Final year', category: 'Technology', tags: ['Python', 'Azure AI', 'Machine Learning'], description: 'Build practical AI prototypes with product and research teams. Work on evaluation, data pipelines, and responsible AI initiatives used by customers across India.' },
  { id: 'op-2', title: 'Product Design Intern', company: 'Razorpay', logo: 'R', tone: 'purple', location: 'Bengaluru, Karnataka', mode: 'On-site', kind: 'Internship', compensation: '₹28,000 / month', posted: '1 day ago', deadline: 'Nov 22, 2026', level: '3rd year+', category: 'Design', tags: ['Figma', 'Product thinking', 'Research'], description: 'Help shape thoughtful financial products. Partner with designers and product managers to explore user needs and turn insights into polished experiences.' },
  { id: 'op-3', title: 'Frontend Engineer', company: 'CRED', logo: 'C', tone: 'navy', location: 'Bengaluru, Karnataka', mode: 'Hybrid', kind: 'Full-time', compensation: '₹12–18 LPA', posted: 'Today', deadline: 'Nov 30, 2026', level: 'Entry level', category: 'Technology', tags: ['React', 'TypeScript', 'CSS'], description: 'Create elegant, high-performance web experiences for members. You will ship production features with a small, collaborative product engineering team.' },
  { id: 'op-4', title: 'Climate Tech Research Intern', company: 'WRI India', logo: 'W', tone: 'green', location: 'New Delhi, Delhi', mode: 'Hybrid', kind: 'Internship', compensation: '₹22,000 / month', posted: '3 days ago', deadline: 'Nov 25, 2026', level: '2nd year+', category: 'Research', tags: ['Research', 'Sustainability', 'Data'], description: 'Support analysis of clean mobility and urban climate projects. Develop research briefs and contribute to practical, evidence-led policy work.' },
  { id: 'op-5', title: 'Cloud Support Associate', company: 'Amazon', logo: 'a', tone: 'orange', location: 'Pune, Maharashtra', mode: 'On-site', kind: 'Full-time', compensation: '₹8–11 LPA', posted: '4 days ago', deadline: 'Dec 02, 2026', level: 'Graduate', category: 'Technology', tags: ['AWS', 'Linux', 'Customer success'], description: 'Help customers solve cloud infrastructure challenges while learning from experienced support engineers and technical specialists.' },
  { id: 'op-6', title: 'National Innovation Challenge', company: 'AICTE · Smart India Hackathon', logo: 'AI', tone: 'teal', location: 'Pan India', mode: 'Hybrid', kind: 'Hackathon', compensation: '₹1,00,000 prize pool', posted: '5 days ago', deadline: 'Nov 20, 2026', level: 'Student teams', category: 'Innovation', tags: ['Team event', 'Public impact', 'Prototype'], description: 'Build a working solution to a real public-sector challenge. Multidisciplinary student teams receive mentoring and present prototypes to expert evaluators.' },
  { id: 'op-7', title: 'Women in STEM Excellence Award', company: 'Foundation for Excellence', logo: 'FE', tone: 'pink', location: 'Pan India', mode: 'Remote', kind: 'Scholarship', compensation: 'Up to ₹60,000 / year', posted: '6 days ago', deadline: 'Dec 10, 2026', level: 'Undergraduate', category: 'Scholarship', tags: ['Need-based', 'STEM', 'Mentorship'], description: 'A merit and need-based award for women pursuing STEM degrees, with financial support and a peer mentorship network.' },
  { id: 'op-8', title: 'Data Analytics with Power BI', company: 'NASSCOM FutureSkills', logo: 'N', tone: 'coral', location: 'Online', mode: 'Remote', kind: 'Course', compensation: 'Free · 6 weeks', posted: '1 week ago', deadline: 'Dec 14, 2026', level: 'Beginner', category: 'Learning', tags: ['Power BI', 'Data', 'Certificate'], description: 'Learn data cleaning, dashboard design, and storytelling through guided projects. Complete the programme with an industry-recognized certificate.' },
  { id: 'op-9', title: 'Graduate Trainee — Civil', company: 'Larsen & Toubro', logo: 'L&T', tone: 'blue', location: 'Chennai, Tamil Nadu', mode: 'On-site', kind: 'Full-time', compensation: '₹6–8 LPA', posted: '2 days ago', deadline: 'Nov 27, 2026', level: 'Final year', category: 'Engineering', tags: ['Civil engineering', 'Project sites', 'Graduate'], description: 'Join teams delivering complex infrastructure projects and develop hands-on engineering, planning and project coordination experience.' },
  { id: 'op-10', title: 'Public Policy Fellow', company: 'NITI Aayog', logo: 'N', tone: 'navy', location: 'New Delhi, Delhi', mode: 'On-site', kind: 'Internship', compensation: '₹20,000 / month', posted: 'Today', deadline: 'Nov 21, 2026', level: 'Postgraduate', category: 'Government', tags: ['Policy', 'Economics', 'Research'], description: 'Contribute to a focused policy project alongside multidisciplinary teams. Fellows gain exposure to research, programme design and public institutions.' },
  { id: 'op-11', title: 'UX Research Intern', company: 'PhonePe', logo: 'P', tone: 'purple', location: 'Bengaluru, Karnataka', mode: 'Hybrid', kind: 'Internship', compensation: '₹25,000 / month', posted: '3 days ago', deadline: 'Nov 26, 2026', level: '3rd year+', category: 'Design', tags: ['User research', 'Figma', 'Fintech'], description: 'Plan and synthesize user research to help teams build accessible, intuitive payment experiences for diverse communities.' },
  { id: 'op-12', title: 'Cybersecurity Analyst Intern', company: 'Cisco Networking Academy', logo: 'C', tone: 'teal', location: 'Remote · India', mode: 'Remote', kind: 'Internship', compensation: '₹18,000 / month', posted: '1 week ago', deadline: 'Dec 04, 2026', level: '2nd year+', category: 'Technology', tags: ['Networking', 'Security', 'Linux'], description: 'Learn to identify common security risks, support threat research and strengthen network fundamentals in a guided internship cohort.' },
  { id: 'op-13', title: 'Young India Fellowship', company: 'Ashoka University', logo: 'A', tone: 'orange', location: 'Sonipat, Haryana', mode: 'On-site', kind: 'Scholarship', compensation: 'Need-based tuition support', posted: '1 week ago', deadline: 'Jan 12, 2027', level: 'Graduate', category: 'Scholarship', tags: ['Leadership', 'Liberal arts', 'Fellowship'], description: 'A multidisciplinary postgraduate programme with need-based financial support, a diverse cohort and experiential learning.' },
  { id: 'op-14', title: 'Software Developer Intern', company: 'Zoho', logo: 'Z', tone: 'coral', location: 'Chennai, Tamil Nadu', mode: 'On-site', kind: 'Internship', compensation: '₹20,000 / month', posted: 'Today', deadline: 'Nov 29, 2026', level: 'Final year', category: 'Technology', tags: ['Java', 'Problem solving', 'SQL'], description: 'Build and test customer-facing software with experienced engineers. Strong fundamentals matter more than prior frameworks or internships.' },
];

export const events: EventItem[] = [
  { id: 'ev-1', title: 'GITAM HackFest 2026', organizer: 'GITAM University', date: 'Nov 08, 2026', day: '08', month: 'NOV', time: '9:00 AM – 6:00 PM', venue: 'Visakhapatnam Campus', city: 'Visakhapatnam', type: 'Hackathon', attendees: 246, color: 'teal' },
  { id: 'ev-2', title: 'Hyderabad Product Meetup', organizer: 'ProductTank Hyderabad', date: 'Nov 12, 2026', day: '12', month: 'NOV', time: '6:30 PM – 8:30 PM', venue: 'T-Hub, Madhapur', city: 'Hyderabad', type: 'Meetup', attendees: 118, color: 'purple' },
  { id: 'ev-3', title: 'IIT Bombay Techfest', organizer: 'IIT Bombay', date: 'Dec 14, 2026', day: '14', month: 'DEC', time: 'All day', venue: 'IIT Bombay, Powai', city: 'Mumbai', type: 'Festival', attendees: 920, color: 'orange' },
  { id: 'ev-4', title: 'AI for Bharat Workshop', organizer: 'Microsoft Learn Student Ambassadors', date: 'Nov 18, 2026', day: '18', month: 'NOV', time: '2:00 PM – 5:00 PM', venue: 'Online · Teams', city: 'Online', type: 'Workshop', attendees: 320, color: 'blue' },
  { id: 'ev-5', title: 'Campus to Career Fair', organizer: 'Osmania University', date: 'Nov 21, 2026', day: '21', month: 'NOV', time: '10:00 AM – 4:00 PM', venue: 'University Arts College', city: 'Hyderabad', type: 'Career fair', attendees: 510, color: 'green' },
  { id: 'ev-6', title: 'PESU Aatmatrisha', organizer: 'PES University', date: 'Nov 27, 2026', day: '27', month: 'NOV', time: '10:00 AM – 8:00 PM', venue: 'PESU Ring Road Campus', city: 'Bengaluru', type: 'Festival', attendees: 680, color: 'pink' },
  { id: 'ev-7', title: 'Designers Connect Pune', organizer: 'DesignUp Community', date: 'Dec 03, 2026', day: '03', month: 'DEC', time: '5:30 PM – 8:00 PM', venue: 'Baner, Pune', city: 'Pune', type: 'Meetup', attendees: 96, color: 'coral' },
  { id: 'ev-8', title: 'National Student Innovation Day', organizer: 'AICTE Innovation Cell', date: 'Dec 10, 2026', day: '10', month: 'DEC', time: '9:30 AM – 5:00 PM', venue: 'Vigyan Bhawan, New Delhi', city: 'New Delhi', type: 'Career fair', attendees: 750, color: 'navy' },
];

export const colleges = [
  { name: 'GITAM University', short: 'GU', city: 'Visakhapatnam', type: 'Private University', students: '22k+', courses: '110 programmes', accent: 'teal', score: '4.7', focus: 'Engineering · Business · Science' },
  { name: 'IIT Hyderabad', short: 'IITH', city: 'Sangareddy', type: 'Institute of National Importance', students: '3.5k+', courses: '55 programmes', accent: 'blue', score: '4.9', focus: 'Technology · Design · Research' },
  { name: 'PES University', short: 'PES', city: 'Bengaluru', type: 'Private University', students: '18k+', courses: '75 programmes', accent: 'orange', score: '4.6', focus: 'Engineering · Management · Health' },
  { name: 'University of Delhi', short: 'DU', city: 'New Delhi', type: 'Central University', students: '90k+', courses: '250+ programmes', accent: 'purple', score: '4.8', focus: 'Arts · Commerce · Sciences' },
  { name: 'IIT Madras', short: 'IITM', city: 'Chennai', type: 'Institute of National Importance', students: '11k+', courses: '120 programmes', accent: 'pink', score: '4.9', focus: 'Engineering · Research · Innovation' },
  { name: 'BITS Pilani', short: 'BITS', city: 'Pilani', type: 'Deemed University', students: '18k+', courses: '70 programmes', accent: 'navy', score: '4.8', focus: 'Engineering · Science · Business' },
];

export const organizations = [
  { name: 'Microsoft India', short: 'M', category: 'Technology', location: 'Hyderabad · Bengaluru', openings: 28, accent: 'blue', verified: true },
  { name: 'AICTE Innovation Cell', short: 'AI', category: 'Government · Education', location: 'New Delhi · Pan India', openings: 14, accent: 'teal', verified: true },
  { name: 'Tata Consultancy Services', short: 'TCS', category: 'IT Services', location: 'Pan India', openings: 42, accent: 'purple', verified: true },
  { name: 'WRI India', short: 'WRI', category: 'Climate · Research', location: 'New Delhi · Mumbai', openings: 7, accent: 'green', verified: true },
  { name: 'Razorpay', short: 'R', category: 'Fintech', location: 'Bengaluru', openings: 16, accent: 'orange', verified: true },
  { name: 'NASSCOM FutureSkills', short: 'N', category: 'Learning · Skills', location: 'Online · Pan India', openings: 10, accent: 'coral', verified: true },
];

export const people = [
  { name: 'Meera Shah', role: 'UX Designer · IIT Bombay', initials: 'MS', color: 'purple', mutual: 12, activeMinutes: 7, followsYou: true },
  { name: 'Arjun Nair', role: 'Computer Science · PES University', initials: 'AN', color: 'blue', mutual: 8, activeMinutes: 18, followsYou: true },
  { name: 'Fatima Khan', role: 'Data Science · Osmania University', initials: 'FK', color: 'pink', mutual: 16, activeMinutes: 3, followsYou: true },
  { name: 'Rohan Iyer', role: 'Product Intern · Razorpay', initials: 'RI', color: 'orange', mutual: 6, activeMinutes: 5, followsYou: false },
  { name: 'Sana Gupta', role: 'Mechanical Engineering · IIT Delhi', initials: 'SG', color: 'teal', mutual: 21, activeMinutes: 12, followsYou: true },
  { name: 'Dev Patel', role: 'Full-stack developer · GITAM', initials: 'DP', color: 'green', mutual: 11, activeMinutes: 9, followsYou: false },
];

export const aiTools = [
  { name: 'Resume Studio', detail: 'Build an ATS-ready resume tailored to your next role.', icon: 'file', tone: 'blue', tag: 'Career' },
  { name: 'Interview Coach', detail: 'Practice role-specific questions and strengthen your answers.', icon: 'sparkle', tone: 'purple', tag: 'Career' },
  { name: 'Cover Letter Writer', detail: 'Turn your experience into a clear, personal application letter.', icon: 'edit', tone: 'orange', tag: 'Writing' },
  { name: 'Study Planner', detail: 'Create a focused weekly plan around your classes and goals.', icon: 'calendar', tone: 'teal', tag: 'Learning' },
  { name: 'Skill Path Finder', detail: 'Discover the next skills to grow into your target role.', icon: 'target', tone: 'pink', tag: 'Learning' },
  { name: 'Project Brainstorm', detail: 'Find practical project ideas matched to your interests.', icon: 'lightbulb', tone: 'green', tag: 'Ideas' },
];

export const achievements = [
  { icon: '🏆', title: 'Completed React for Beginners', date: 'Oct 28, 2024', tone: 'gold' },
  { icon: '🥈', title: 'Won 2nd place at GITAM Hackathon', date: 'Oct 12, 2024', tone: 'blue' },
  { icon: '📄', title: 'Shortlisted for Infosys Springboard Program', date: 'Sep 30, 2024', tone: 'teal' },
];

export const learningCourses = [
  { title: 'React for Beginners', provider: 'Microsoft Learn', progress: 100, color: 'blue', label: 'Completed' },
  { title: 'Data Visualization with Power BI', provider: 'NASSCOM FutureSkills', progress: 72, color: 'purple', label: 'In progress' },
  { title: 'Foundations of UX Design', provider: 'Google Career Certificates', progress: 48, color: 'orange', label: 'In progress' },
  { title: 'Communication for Career Growth', provider: 'Infosys Springboard', progress: 0, color: 'teal', label: 'Not started' },
];

export const applicationRecords = [
  { role: 'AI & Data Science Intern', company: 'Microsoft India', date: 'Oct 29, 2026', status: 'Interview', color: 'purple' },
  { role: 'Product Design Intern', company: 'Razorpay', date: 'Oct 27, 2026', status: 'In review', color: 'blue' },
  { role: 'Frontend Engineer', company: 'CRED', date: 'Oct 22, 2026', status: 'Submitted', color: 'teal' },
  { role: 'Climate Tech Research Intern', company: 'WRI India', date: 'Oct 18, 2026', status: 'Shortlisted', color: 'green' },
];
