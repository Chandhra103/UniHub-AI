import { useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, BookOpen, BriefcaseBusiness, Check,
  ChevronRight, FileBadge, GraduationCap, MapPin, Pencil, Plus, ShieldCheck,
  Sparkles, Star, Users,
} from 'lucide-react';
import { Chip, Modal, PageHeading, PrimaryButton, SectionHeader, SoftButton } from './components';
import type { AppActions } from './types';
import type { AuthenticatedUser } from './auth/types';

const experienceItems = [
  { role: 'Product Design Intern', company: 'Razorpay · Bengaluru', date: 'May 2026 — Aug 2026', detail: 'Partnered with product and engineering teams to prototype onboarding improvements and synthesize user feedback.' },
  { role: 'Student Research Assistant', company: 'GITAM Human-Centered Computing Lab', date: 'Jan 2026 — Apr 2026', detail: 'Supported an accessibility study and prepared annotated research summaries for faculty and student collaborators.' },
];

const educationItems = [
  { course: 'B.Tech · Computer Science', college: 'GITAM University · Visakhapatnam', date: '2022 — 2026', note: 'Final year · CGPA 8.7 / 10' },
  { course: 'Intermediate · MPC', college: 'Sri Chaitanya Junior College · Visakhapatnam', date: '2020 — 2022', note: 'Mathematics, Physics and Chemistry' },
];

const projects = [
  { title: 'Campus Access Map', type: 'Accessibility · React', detail: 'A student-built map that highlights step-free paths, quiet study zones and accessible building entrances.' },
  { title: 'Local Climate Data Explorer', type: 'Data storytelling · Python', detail: 'An interactive exploration of air quality and temperature patterns across Visakhapatnam.' },
];

const certificates = [
  { name: 'React for Beginners', provider: 'Microsoft Learn', date: 'Oct 2026' },
  { name: 'Foundations of UX Design', provider: 'Google Career Certificates', date: 'In progress · 48%' },
  { name: 'Power BI Data Visualization', provider: 'NASSCOM FutureSkills', date: 'In progress · 72%' },
];

const skillGroups = ['React', 'Python', 'SQL', 'JavaScript', 'Machine Learning', 'Data Analysis', 'Power BI', 'Figma', 'User research'];
const profileTabs = ['Overview', 'Experience', 'Education', 'Projects', 'Certificates'] as const;
type ProfileTab = typeof profileTabs[number];

export function StudentProfilePage({ toast, navigate, user, saveProfile }: AppActions & { user: AuthenticatedUser; saveProfile?: (patch: { displayName: string; profile: Record<string, unknown> }) => Promise<void> }) {
  const [name, setName] = useState(user.displayName || 'UniHub student');
  const [summary, setSummary] = useState(typeof user.profile.summary === 'string' ? user.profile.summary : 'Add a short introduction to your profile. Your experience, education and projects can help opportunities find you.');
  const [university, setUniversity] = useState(typeof user.profile.university === 'string' ? user.profile.university : '');
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveStudentProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveProfile?.({ displayName: name, profile: { summary, university } });
      toast('Your profile was updated');
      setEditing(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Your profile could not be saved. Please try again.');
    } finally { setSaving(false); }
  };

  return <div className="student-profile-page">
    <PageHeading eyebrow="YOUR PROFESSIONAL STORY" title="Student profile" description="A clear snapshot of what you have learned, built and are ready to do next." action={<Chip tone="green"><ShieldCheck size={15} /> Visible to opportunities</Chip>} />
    <section className="student-profile-hero">
      <div className="student-profile-avatar-wrap">{user.displayName === 'Ananya Reddy' ? <img src="/assets/ananya-avatar.png" alt={user.displayName} /> : <span className="student-profile-avatar-fallback">{user.displayName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}<span><i /> Open to internships</span></div>
      <div className="student-profile-identity"><span className="eyebrow"><GraduationCap size={14} /> {String(user.profile.fieldOfStudy || 'STUDENT PROFILE').toUpperCase()}</span><h1>{name}</h1><p><span><BookOpen size={15} /> {university || 'Add your institution'}</span><span><MapPin size={15} /> {String(user.profile.location || 'Add your location')}</span></p><div className="student-profile-tags"><Chip tone="blue">Product design</Chip><Chip tone="teal">Applied AI</Chip><Chip tone="purple">Accessibility</Chip></div></div>
      <div className="student-profile-strength"><div><span>Profile strength</span><b>92%</b></div><div className="profile-strength-track"><span /></div><small>Strong profile · 2 suggestions to go</small><div className="student-profile-actions"><SoftButton onClick={() => toast('A clean resume preview is ready in this demo')}><ArrowDownToLine size={15} /> Preview resume</SoftButton><PrimaryButton onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</PrimaryButton></div></div>
    </section>

    <nav className="student-profile-tabs" aria-label="Profile sections">{profileTabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}{tab === 'Overview' && <span className="profile-tab-count">3</span>}</button>)}</nav>

    {activeTab === 'Overview' && <div className="student-profile-columns">
      <div className="student-profile-main-column">
        <section className="student-profile-panel"><SectionHeader title="About" action={<button className="profile-icon-link" onClick={() => setEditing(true)} aria-label="Edit summary"><Pencil size={16} /></button>} /><p className="profile-summary-text">{summary}</p><div className="profile-summary-meta"><span><Users size={15} /> 248 connections</span><span><Star size={15} /> 3,420 learning points</span><button onClick={() => navigate('/connections')}>View network <ChevronRight size={15} /></button></div></section>
        <section className="student-profile-panel"><SectionHeader title="Experience" action={<button className="profile-icon-link" onClick={() => toast('Add experience form opened in this demo')} aria-label="Add experience"><Plus size={17} /></button>} /><div className="profile-timeline">{experienceItems.map((item) => <article className="profile-timeline-item" key={item.role}><span className="profile-timeline-mark"><BriefcaseBusiness size={17} /></span><div><h3>{item.role}</h3><b>{item.company}</b><small>{item.date}</small><p>{item.detail}</p></div></article>)}</div><button className="profile-view-all" onClick={() => setActiveTab('Experience')}>View all experience <ArrowRight size={15} /></button></section>
        <section className="student-profile-panel"><SectionHeader title="Education" action={<button className="profile-icon-link" onClick={() => toast('Add education form opened in this demo')} aria-label="Add education"><Plus size={17} /></button>} /><div className="profile-timeline">{educationItems.slice(0, 1).map((item) => <article className="profile-timeline-item" key={item.course}><span className="profile-timeline-mark profile-mark-orange"><GraduationCap size={18} /></span><div><h3>{item.course}</h3><b>{university || item.college}</b><small>{item.date}</small><p>{item.note}</p></div></article>)}</div><button className="profile-view-all" onClick={() => setActiveTab('Education')}>View education <ArrowRight size={15} /></button></section>
      </div>
      <aside className="student-profile-side-column">
        <section className="student-profile-panel"><SectionHeader title="Skills" action={<button className="profile-icon-link" onClick={() => toast('Skill editor opened in this demo')} aria-label="Edit skills"><Pencil size={16} /></button>} /><div className="student-profile-skill-list">{skillGroups.map((skill, index) => <Chip key={skill} tone={index < 2 ? 'blue' : 'neutral'}>{skill}</Chip>)}</div><button className="profile-view-all" onClick={() => toast('Showing your complete skill set')}>View all 9 skills <ArrowRight size={15} /></button></section>
        <section className="student-profile-panel"><SectionHeader title="Learning & certificates" action={<button className="profile-icon-link" onClick={() => navigate('/courses')} aria-label="Browse learning paths"><ArrowRight size={16} /></button>} /><div className="profile-certificate-list">{certificates.map((item) => <div className="profile-certificate-row" key={item.name}><span><FileBadge size={17} /></span><div><b>{item.name}</b><small>{item.provider} · {item.date}</small></div>{item.date.startsWith('Oct') && <Check size={15} className="certificate-check" />}</div>)}</div><button className="profile-view-all" onClick={() => navigate('/courses')}>Explore learning paths <ArrowRight size={15} /></button></section>
        <section className="profile-encouragement"><span><Sparkles size={18} /></span><div><b>Your work is adding up</b><p>Your learning progress and experience are visible to 28 organizations.</p><button onClick={() => navigate('/opportunities')}>See matching roles <ArrowRight size={14} /></button></div></section>
      </aside>
    </div>}

    {activeTab === 'Experience' && <section className="student-profile-panel profile-tab-page"><SectionHeader title="Experience" subtitle="Roles, volunteering and practical experience." action={<SoftButton onClick={() => toast('Add experience form opened in this demo')}><Plus size={15} /> Add experience</SoftButton>} /><div className="profile-timeline">{experienceItems.map((item) => <article className="profile-timeline-item" key={item.role}><span className="profile-timeline-mark"><BriefcaseBusiness size={17} /></span><div><h3>{item.role}</h3><b>{item.company}</b><small>{item.date}</small><p>{item.detail}</p></div></article>)}</div></section>}
    {activeTab === 'Education' && <section className="student-profile-panel profile-tab-page"><SectionHeader title="Education" subtitle="Your academic journey and current focus." action={<SoftButton onClick={() => toast('Add education form opened in this demo')}><Plus size={15} /> Add education</SoftButton>} /><div className="profile-timeline">{educationItems.map((item) => <article className="profile-timeline-item" key={item.course}><span className="profile-timeline-mark profile-mark-orange"><GraduationCap size={18} /></span><div><h3>{item.course}</h3><b>{item.college}</b><small>{item.date}</small><p>{item.note}</p></div></article>)}</div></section>}
    {activeTab === 'Projects' && <section className="student-profile-panel profile-tab-page"><SectionHeader title="Selected projects" subtitle="A few things you have built and explored." action={<SoftButton onClick={() => toast('Add project form opened in this demo')}><Plus size={15} /> Add project</SoftButton>} /><div className="student-project-grid">{projects.map((project) => <article className="student-project-card" key={project.title}><span><Sparkles size={17} /></span><Chip tone="blue">{project.type}</Chip><h3>{project.title}</h3><p>{project.detail}</p><button onClick={() => toast(`${project.title} project details opened`)}>View project <ArrowRight size={15} /></button></article>)}</div></section>}
    {activeTab === 'Certificates' && <section className="student-profile-panel profile-tab-page"><SectionHeader title="Certificates & learning" subtitle="Completed credentials and active learning paths." action={<SoftButton onClick={() => navigate('/courses')}><BookOpen size={15} /> Find a course</SoftButton>} /><div className="profile-certificate-list profile-certificate-list-wide">{certificates.map((item) => <div className="profile-certificate-row" key={item.name}><span><FileBadge size={18} /></span><div><b>{item.name}</b><small>{item.provider} · {item.date}</small></div>{item.date.startsWith('Oct') ? <Chip tone="green">Completed</Chip> : <Chip tone="blue">In progress</Chip>}</div>)}</div></section>}

    {editing && <Modal title="Edit your profile" subtitle="Keep your profile clear, useful and up to date." onClose={() => setEditing(false)}><form className="modal-form" onSubmit={(event) => void saveStudentProfile(event)}><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Professional summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} /></label><label>University<input value={university} onChange={(event) => setUniversity(event.target.value)} /></label><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'} <Check size={15} /></PrimaryButton></form></Modal>}
  </div>;
}
