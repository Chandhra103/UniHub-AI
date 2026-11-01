import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowDownWideNarrow, ArrowRight, Award, Bookmark, BookOpen, BriefcaseBusiness,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  Compass, FileText, Filter, Gift, GraduationCap, Heart, Landmark, Lightbulb,
  MapPin, MessageCircle, PenLine, Search, Send, Settings,
  ShieldCheck, Sparkles, Star, Target, ThumbsUp, UserPlus, Users,
  X, TrendingUp, Eye, Bell, SlidersHorizontal, Building2,
} from 'lucide-react';
import {
  achievements, aiTools, applicationRecords, colleges, events, learningCourses,
  opportunities, organizations, people,
} from './data';
import type { EventItem, Opportunity } from './data';
import type { AppActions } from './types';
import {
  BrandMark, Chip, EmptyState, Modal, PageHeading, PrimaryButton, SearchField,
  SectionHeader, SoftButton, StatCard, TextButton,
} from './components';

const moneyTicks = ['0', '500', '1,000', '1,500', '2,000'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const earnings = [120, 260, 480, 920, 780, 650, 980, 740, 630, 890, 1240];

function SelectControl({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="select-control"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></label>;
}

function ProfileTabContent({ active, navigate }: { active: string; navigate: (path: string) => void }) {
  const copy: Record<string, { title: string; subtitle: string; button: string; path: string }> = {
    Connections: { title: 'Your growing network', subtitle: 'You are connected with 248 students and mentors. Find people learning and building in your fields.', button: 'Explore connections', path: '/connections' },
    Followers: { title: 'People following your journey', subtitle: '318 students follow your progress, project updates, and campus stories.', button: 'See followers', path: '/connections' },
    Post: { title: 'Share a little progress', subtitle: 'Celebrate a new skill, project milestone, or opportunity with your UniHub community.', button: 'Write a post', path: '/posts' },
    Rewards: { title: 'Your rewards at a glance', subtitle: 'You have 3,420 points ready to turn into learning perks and career benefits.', button: 'Explore rewards', path: '/rewards' },
  };
  const panel = copy[active];
  if (!panel) return null;
  return <div className="profile-tab-panel"><span className="profile-tab-symbol"><Users size={23} /></span><div><h3>{panel.title}</h3><p>{panel.subtitle}</p></div><SoftButton onClick={() => navigate(panel.path)}>{panel.button}<ArrowRight size={16} /></SoftButton></div>;
}

export function DashboardPage({ navigate, toast }: AppActions & { path: string }) {
  const [activeTab, setActiveTab] = useState('Status');
  const [showEdit, setShowEdit] = useState(false);
  const [skills, setSkills] = useState(['React', 'Python', 'SQL', 'JavaScript', 'Machine Learning', 'Data Analysis', 'Power BI']);
  const [draftSkill, setDraftSkill] = useState('');
  const [name, setName] = useState('Ananya Reddy');
  const tabs = [
    { label: 'Connections', icon: <Users size={22} fill="currentColor" /> },
    { label: 'Followers', icon: <Users size={23} fill="currentColor" /> },
    { label: 'Post', icon: <FileText size={22} fill="currentColor" /> },
    { label: 'Rewards', icon: <Award size={22} fill="currentColor" /> },
    { label: 'Status', icon: <TrendingUp size={23} /> },
  ];

  return <div className="dashboard-page">
    <section className="profile-hero">
      <img className="profile-avatar" src="/assets/ananya-avatar.png" alt="Ananya Reddy" />
      <div className="profile-identity">
        <h1>{name}</h1>
        <div className="profile-contact"><span><span className="contact-icon">☎</span> +91 98765 43210</span><span><span className="contact-icon">✉</span> ananya@gitam.edu</span></div>
        <div className="profile-tags"><Chip>GITAM University</Chip><Chip>Computer Science</Chip><Chip>Final Year</Chip></div>
      </div>
      <div className="profile-note"><p>Learning today<br />for a brighter tomorrow</p><SoftButton onClick={() => setShowEdit(true)}><PenLine size={17} /> Edit profile</SoftButton></div>
    </section>

    <nav className="profile-tabs" aria-label="Student profile sections">
      {tabs.map((tab) => <button key={tab.label} className={`profile-tab ${activeTab === tab.label ? 'selected' : ''}`} onClick={() => setActiveTab(tab.label)}>{tab.icon}<span>{tab.label}</span></button>)}
    </nav>
    <ProfileTabContent active={activeTab} navigate={navigate} />

    <section className="stat-grid" aria-label="Student status summary">
      <StatCard label="Points" value="3,420" trend="+12%" tone="green" icon={<Star size={32} fill="currentColor" />} />
      <StatCard label="Applications" value="12" trend="+33%" tone="blue" icon={<FileText size={31} fill="currentColor" />} />
      <StatCard label="Interviews" value="3" trend="+100%" tone="purple" icon={<TrendingUp size={31} />} />
      <StatCard label="Offers" value="1" trend="New this month" tone="orange" icon={<BriefcaseBusiness size={31} fill="currentColor" />} />
    </section>

    <section className="dashboard-grid">
      <article className="dashboard-panel learning-panel">
        <SectionHeader title="Learning paths" action={<TextButton onClick={() => navigate('/courses')}>View all</TextButton>} />
        <div className="learning-content">
          <div className="donut-wrap"><div className="learning-donut"><div><strong>72%</strong><span>Completed</span></div></div></div>
          <div className="learning-legend">
            <div><i className="legend-dot teal-dot" /><span>Completed</span><b>72% (9/12)</b></div>
            <div><i className="legend-dot orange-dot" /><span>In progress</span><b>20% (2/12)</b></div>
            <div><i className="legend-dot gray-dot" /><span>Not started</span><b>8% (1/12)</b></div>
          </div>
        </div>
      </article>
      <article className="dashboard-panel earnings-panel">
        <SectionHeader title="Earnings this month: Rs 1,240" action={<TextButton onClick={() => navigate('/rewards')}>View details</TextButton>} />
        <div className="chart-layout">
          <div className="chart-y-labels">{moneyTicks.map((tick) => <span key={tick}>{tick}</span>)}</div>
          <div className="earnings-chart-wrap">
            <svg className="earnings-chart" viewBox="0 0 620 178" role="img" aria-label="Monthly earnings from January to November, rising to 1,240 rupees in November">
              <defs><linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c158aa" stopOpacity=".18" /><stop offset="100%" stopColor="#c158aa" stopOpacity="0" /></linearGradient></defs>
              {[25, 58, 91, 124, 157].map((y) => <line key={y} x1="16" x2="606" y1={y} y2={y} stroke="#edf0f3" strokeWidth="1" />)}
              <polygon points="20,151 78,140 136,125 194,94 252,104 310,112 368,91 426,106 484,113 542,97 594,76 594,158 20,158" fill="url(#earnFill)" />
              <polyline points="20,151 78,140 136,125 194,94 252,104 310,112 368,91 426,106 484,113 542,97 594,76" fill="none" stroke="#aa4da4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {earnings.map((value, index) => {
                const x = 20 + index * 57.4;
                const y = 151 - ((value - 120) / 1120) * 75;
                return <circle key={months[index]} cx={x} cy={y} r="4.8" fill="#aa4da4"><title>{months[index]}: Rs {value}</title></circle>;
              })}
              <g className="chart-callout"><rect x="536" y="29" width="88" height="34" rx="11" fill="#a445a4" /><text x="580" y="51" textAnchor="middle" fill="white">Rs 1,240</text><path d="M579 63L594 76" stroke="#a445a4" strokeWidth="2" /></g>
            </svg>
            <div className="chart-x-labels">{months.map((month) => <span key={month}>{month}</span>)}</div>
          </div>
        </div>
      </article>
      <article className="dashboard-panel skills-panel">
        <SectionHeader title="Skills" action={<TextButton onClick={() => setShowEdit(true)}>Edit</TextButton>} />
        <div className="skills-list">{skills.map((skill, index) => <Chip key={skill} tone={index < 2 ? 'blue' : 'neutral'}>{skill}</Chip>)}</div>
      </article>
      <article className="dashboard-panel wins-panel">
        <SectionHeader title="Recent wins" action={<TextButton onClick={() => navigate('/rewards')}>View all</TextButton>} />
        <div className="wins-list">{achievements.map((item) => <div className="win-row" key={item.title}><span className={`win-icon ${item.tone}`}>{item.icon}</span><span className="win-title">{item.title}</span><time>{item.date}</time></div>)}</div>
      </article>
    </section>

    <section className="dashboard-next-step"><div className="next-step-icon"><Sparkles size={20} /></div><div><strong>Your next step is ready</strong><p>Three opportunities match your skills and preferred locations.</p></div><SoftButton onClick={() => navigate('/opportunities')}>Explore matches <ArrowRight size={16} /></SoftButton></section>

    {showEdit && <Modal title="Edit your profile" subtitle="Keep your student profile current so opportunities find you." onClose={() => setShowEdit(false)}>
      <form className="modal-form" onSubmit={(event) => { event.preventDefault(); const skill = draftSkill.trim(); if (skill && !skills.includes(skill)) setSkills((current) => [...current, skill]); setDraftSkill(''); setShowEdit(false); toast('Your profile updates have been saved'); }}>
        <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>University<input defaultValue="GITAM University" /></label>
        <label>Course and year<input defaultValue="Computer Science · Final Year" /></label>
        <label>Add a skill<input value={draftSkill} onChange={(event) => setDraftSkill(event.target.value)} placeholder="e.g. Product design" /></label>
        <div className="modal-skill-list">{skills.slice(0, 5).map((skill) => <Chip key={skill}>{skill}</Chip>)}</div>
        <PrimaryButton type="submit">Save profile <Check size={16} /></PrimaryButton>
      </form>
    </Modal>}
  </div>;
}

const eventCoords = [
  { id: 'ev-1', x: 49, y: 33 }, { id: 'ev-2', x: 66, y: 49 }, { id: 'ev-3', x: 80, y: 66 },
  { id: 'ev-4', x: 34, y: 57 }, { id: 'ev-5', x: 60, y: 72 }, { id: 'ev-6', x: 27, y: 38 },
  { id: 'ev-7', x: 44, y: 80 }, { id: 'ev-8', x: 72, y: 25 },
];

function EventCard({ event, selected, onSelect, actions }: { event: EventItem; selected: boolean; onSelect: () => void; actions: AppActions }) {
  return <article className={`event-card ${selected ? 'event-selected' : ''}`} onClick={onSelect}>
    <div className={`event-date tone-bg-${event.color}`}><b>{event.day}</b><span>{event.month}</span></div>
    <div className="event-card-body"><div className="event-type-row"><Chip tone={event.color}>{event.type}</Chip><span><Users size={14} /> {event.attendees} attending</span></div><h3>{event.title}</h3><p className="event-organizer">{event.organizer}</p><div className="event-meta"><span><CalendarDays size={15} /> {event.date}</span><span><Clock3 size={15} /> {event.time}</span><span><MapPin size={15} /> {event.venue}</span></div><div className="event-card-actions"><SoftButton onClick={(e) => { e.stopPropagation(); actions.toggleSaved(event.id); }}>{actions.savedIds.includes(event.id) ? <Check size={16} /> : <Bookmark size={16} />} {actions.savedIds.includes(event.id) ? 'Saved' : 'Save event'}</SoftButton><PrimaryButton onClick={(e) => { e.stopPropagation(); actions.apply(event.id, event.title); }}>{actions.appliedIds.includes(event.id) ? 'Registered' : 'Register'} <ArrowRight size={15} /></PrimaryButton></div></div>
  </article>;
}

export function EventsPage({ path, ...actions }: AppActions & { path: string }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All locations');
  const [type, setType] = useState('All event types');
  const [sort, setSort] = useState('Soonest first');
  const [selected, setSelected] = useState('ev-1');
  const [view, setView] = useState<'map' | 'list'>('map');
  const isFestival = path === '/events/festivals';
  const isMeetup = path === '/events/meetups';
  const title = isFestival ? 'College festivals' : isMeetup ? 'Company meetups' : 'Discover events around you';
  const subtitle = isFestival ? 'Find your next campus celebration, cultural showcase or inter-college fest.' : isMeetup ? 'Meet the people building your future at company and industry gatherings.' : 'From campus festivals to career meetups, find something worth showing up for.';
  const shownEvents = useMemo(() => {
    let list = events.filter((event) => {
      if (isFestival && event.type !== 'Festival') return false;
      if (isMeetup && event.type !== 'Meetup') return false;
      if (type !== 'All event types' && event.type !== type) return false;
      if (city !== 'All locations' && event.city !== city) return false;
      const text = `${event.title} ${event.organizer} ${event.venue} ${event.city} ${event.type}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
    if (sort === 'Most attending') list = [...list].sort((a, b) => b.attendees - a.attendees);
    else if (sort === 'A–Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return list;
  }, [city, isFestival, isMeetup, query, sort, type]);
  const focusedEvent = shownEvents.find((event) => event.id === selected) ?? shownEvents[0];
  const cityOptions = ['All locations', 'Visakhapatnam', 'Hyderabad', 'Mumbai', 'Bengaluru', 'Pune', 'New Delhi', 'Online'];

  return <div className="events-page">
    <div className="events-intro-band"><div><div className="eyebrow"><Compass size={14} /> YOUR CAMPUS, YOUR CITY</div><h1>{title}</h1><p>{subtitle}</p></div><div className="events-nearby-chip"><MapPin size={16} /><span>Showing opportunities near <b>India</b></span><ChevronDown size={15} /></div></div>
    <div className="events-toolbar"><SearchField value={query} onChange={setQuery} label="Search events" placeholder="Search events, organizers or places" /><SelectControl label="Location" value={city} onChange={setCity} options={cityOptions} /><SelectControl label="Event type" value={type} onChange={setType} options={['All event types', 'Festival', 'Meetup', 'Hackathon', 'Workshop', 'Career fair']} /><SelectControl label="Sort by" value={sort} onChange={setSort} options={['Soonest first', 'Most attending', 'A–Z']} /><button className="filter-icon-button" onClick={() => { setType('All event types'); setCity('All locations'); setQuery(''); }} aria-label="Clear event filters"><SlidersHorizontal size={18} /></button></div>
    <div className="event-results-top"><div><span className="results-count">{shownEvents.length} events</span><span className="results-caption">curated for students</span></div><div className="view-toggle"><button className={view === 'map' ? 'is-selected' : ''} onClick={() => setView('map')}><MapPin size={15} /> Map & list</button><button className={view === 'list' ? 'is-selected' : ''} onClick={() => setView('list')}><CalendarDays size={15} /> List</button></div></div>
    <div className={`event-discovery-layout ${view === 'list' ? 'event-list-only' : ''}`}>
      <section className="map-panel" aria-label="Interactive event map"><div className="map-heading"><div><b>Events in your network</b><span>{city === 'All locations' ? 'Explore student events across India' : `Selected city · ${city}`}</span></div><button onClick={() => { setCity('All locations'); setSelected('ev-1'); }}><Compass size={15} /> Reset map</button></div><div className="map-canvas">
        <div className="map-water water-one" /><div className="map-water water-two" />
        <svg className="map-roads" viewBox="0 0 700 480" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 360 C120 320 180 330 280 240 S430 130 730 90" /><path d="M50 -20 C160 120 180 180 300 230 S490 310 650 510" /><path d="M-10 90 C150 135 200 75 340 110 S520 185 710 195" /><path d="M160 500 C240 385 330 330 370 240 S460 100 540 -20" /><path d="M30 260 C175 210 225 275 360 300 S530 360 700 320" /></svg>
        <span className="map-label label-west">ARABIAN SEA</span><span className="map-label label-india">INDIA</span><span className="map-label label-bay">BAY OF BENGAL</span>
        {eventCoords.map((point) => {
          const event = shownEvents.find((item) => item.id === point.id);
          if (!event) return null;
          return <button className={`map-pin ${selected === event.id ? 'pin-active' : ''}`} key={event.id} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => setSelected(event.id)} aria-label={`${event.title}, ${event.city}`}><span><MapPin size={16} fill="currentColor" /></span></button>;
        })}
        {focusedEvent && <div className="map-tooltip" style={{ left: `${eventCoords.find((point) => point.id === focusedEvent.id)?.x ?? 50}%`, top: `${eventCoords.find((point) => point.id === focusedEvent.id)?.y ?? 50}%` }}><b>{focusedEvent.title}</b><span>{focusedEvent.city} · {focusedEvent.date}</span></div>}
      </div><div className="map-legend"><span><i className="map-dot dot-event" /> Student events</span><span><i className="map-dot dot-festival" /> Festivals</span><span className="map-scale">Map preview · tap a pin to explore</span></div></section>
      <section className="event-list-panel" id="event-list"><div className="event-list-heading"><div><h2>Happening soon</h2><p>{shownEvents.length} events near your network</p></div><button className="round-action" onClick={() => setSort((current) => current === 'Soonest first' ? 'Most attending' : current === 'Most attending' ? 'A–Z' : 'Soonest first')} aria-label={`Cycle event sort; current: ${sort}`}><ArrowDownWideNarrow size={17} /></button></div><div className="event-list-scroll">{shownEvents.length ? shownEvents.map((event) => <EventCard key={event.id} event={event} selected={focusedEvent?.id === event.id} onSelect={() => setSelected(event.id)} actions={actions} />) : <EmptyState title="No events match these filters" body="Try another city, category or search term." action={<SoftButton onClick={() => { setCity('All locations'); setType('All event types'); setQuery(''); }}>Clear filters</SoftButton>} />}</div></section>
    </div>
    <section className="event-bottom-note"><span><Sparkles size={17} /></span><div><b>Your campus network is active</b><p>Discover local experiences and keep your saved events together.</p></div><TextButton onClick={() => actions.navigate('/community')}>Meet your community <ArrowRight size={15} /></TextButton></section>
  </div>;
}

const opportunitySections: Record<string, { title: string; subtitle: string; kind?: Opportunity['kind']; badge: string; accent: string }> = {
  '/opportunities': { title: 'Opportunities built around you', subtitle: 'Explore verified roles, internships and learning paths selected for your next step.', badge: 'YOUR NEXT CHAPTER', accent: 'teal' },
  '/internships': { title: 'Find an internship that fits', subtitle: 'Hands-on experiences from public institutions, growing teams and India’s leading companies.', kind: 'Internship', badge: 'INTERNSHIPS', accent: 'orange' },
  '/jobs': { title: 'Start your career with confidence', subtitle: 'Early-career roles from teams ready to help you build real-world experience.', kind: 'Full-time', badge: 'JOBS & EARLY CAREER', accent: 'blue' },
  '/hackathons': { title: 'Make something that matters', subtitle: 'Join student teams, solve real challenges and turn ideas into working prototypes.', kind: 'Hackathon', badge: 'BUILD · LEARN · COMPETE', accent: 'purple' },
  '/scholarships': { title: 'Support for your next milestone', subtitle: 'Explore financial aid, fellowships and awards designed to help students thrive.', kind: 'Scholarship', badge: 'SCHOLARSHIPS & FELLOWSHIPS', accent: 'green' },
  '/courses': { title: 'Skills that move you forward', subtitle: 'Learn at your pace with guided programmes and practical, career-ready courses.', kind: 'Course', badge: 'COURSES & LEARNING', accent: 'blue' },
  '/government-portals': { title: 'Government opportunities, together', subtitle: 'A student-friendly directory of verified national programmes and public portals.', badge: 'GOVERNMENT PORTALS', accent: 'navy' },
};

const governmentResources = [
  { name: 'AICTE National Internship Portal', description: 'Internships from ministries, PSUs, state governments and employer partners.', logo: 'AICTE', tone: 'teal', category: 'Internships', status: 'Open opportunities', url: 'AICTE · Ministry of Education' },
  { name: 'National Scholarship Portal', description: 'Central and state scholarship programmes with eligibility and application windows.', logo: 'NSP', tone: 'orange', category: 'Scholarships', status: 'Applications open', url: 'Ministry of Education' },
  { name: 'MyGov India', description: 'Public challenges, quizzes, consultations and citizen-led innovation programmes.', logo: 'MyG', tone: 'blue', category: 'Public participation', status: '12 active activities', url: 'Government of India' },
  { name: 'Skill India Digital Hub', description: 'Discover skill courses, certifications and employment-linked training.', logo: 'SIDH', tone: 'purple', category: 'Learning', status: 'Free courses available', url: 'Ministry of Skill Development' },
  { name: 'National Career Service', description: 'Career guidance, job fairs and employment services for students and graduates.', logo: 'NCS', tone: 'green', category: 'Career services', status: 'Updated this week', url: 'Ministry of Labour & Employment' },
  { name: 'Digital India Internship Scheme', description: 'Explore technology and public-service projects from Digital India teams.', logo: 'DI', tone: 'navy', category: 'Internships', status: 'Next cycle · Jan 2027', url: 'MeitY · Government of India' },
];

function OpportunityCard({ item, actions }: { item: Opportunity; actions: AppActions }) {
  const isSaved = actions.savedIds.includes(item.id);
  const isApplied = actions.appliedIds.includes(item.id);
  return <article className="opportunity-card">
    <div className="opportunity-card-top"><BrandMark label={item.logo} tone={item.tone} /><button className={`bookmark-button ${isSaved ? 'is-saved' : ''}`} aria-label={isSaved ? `Remove ${item.title} from saved` : `Save ${item.title}`} onClick={() => actions.toggleSaved(item.id)}>{isSaved ? <Check size={17} /> : <Bookmark size={17} />}</button></div>
    <div className="company-line">{item.company}<span className="verified-dot"><ShieldCheck size={13} fill="currentColor" /></span><span className="posted-time">· {item.posted}</span></div>
    <h3>{item.title}</h3><p className="opportunity-description">{item.description}</p>
    <div className="opportunity-info"><span><MapPin size={14} /> {item.location}</span><span><BriefcaseBusiness size={14} /> {item.mode}</span></div>
    <div className="opportunity-tags">{item.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>
    <div className="opportunity-card-footer"><div><span className="compensation-label">{item.kind === 'Hackathon' ? 'Prize & benefits' : item.kind === 'Scholarship' ? 'Support' : item.kind === 'Course' ? 'Programme' : 'Compensation'}</span><strong>{item.compensation}</strong></div><PrimaryButton onClick={() => actions.apply(item.id, item.title)} className={isApplied ? 'button-applied' : ''}>{isApplied ? 'Applied' : item.kind === 'Course' ? 'Start learning' : item.kind === 'Hackathon' ? 'Join challenge' : 'Apply'} {isApplied ? <Check size={15} /> : <ArrowRight size={15} />}</PrimaryButton></div>
    <div className="opportunity-deadline"><Clock3 size={13} /> Apply by {item.deadline}<span>{item.level}</span></div>
  </article>;
}

function PortalCard({ resource, actions }: { resource: typeof governmentResources[number]; actions: AppActions }) {
  return <article className="portal-card"><div className="portal-card-top"><BrandMark label={resource.logo} tone={resource.tone} large /><span className="portal-status"><i />{resource.status}</span></div><div className="eyebrow">{resource.category}</div><h3>{resource.name}</h3><p>{resource.description}</p><div className="portal-card-bottom"><span>{resource.url}</span><button onClick={() => actions.toast(`${resource.name} added to your portal shortlist`)}>Explore <ArrowRight size={15} /></button></div></article>;
}

function LearningPathCards({ toast }: { toast: (message: string) => void }) {
  return <section className="learning-paths-section"><SectionHeader title="Pick up where you left off" subtitle="Your current learning paths and completed certificates." /><div className="learning-paths-grid">{learningCourses.map((course) => <article className="learning-path-card" key={course.title}><div className="learning-path-top"><span className={`learning-path-icon ${course.color}`}><BookOpen size={18} /></span><Chip tone={course.progress === 100 ? 'green' : course.progress > 0 ? 'blue' : 'neutral'}>{course.label}</Chip></div><h3>{course.title}</h3><p>{course.provider}</p><div className="learning-progress-track"><span className={`progress-${course.color}`} style={{ width: `${course.progress}%` }} /></div><div className="learning-path-foot"><span>{course.progress === 100 ? 'Certificate ready' : `${course.progress}% complete`}</span><button onClick={() => toast(course.progress === 100 ? `${course.title} certificate opened` : `Continuing ${course.title}`)}>{course.progress === 100 ? 'View certificate' : 'Continue'} <ArrowRight size={14} /></button></div></article>)}</div></section>;
}

export function OpportunitiesPage({ path, ...actions }: AppActions & { path: string }) {
  const section = opportunitySections[path] ?? opportunitySections['/opportunities'];
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All locations');
  const [mode, setMode] = useState('All work modes');
  const [sort, setSort] = useState('Recommended');
  const [selectedChip, setSelectedChip] = useState('All');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const chips = ['All', 'Technology', 'Design', 'Research', 'Engineering', 'Government'];
  const isGovernment = path === '/government-portals';
  const filteredItems = useMemo(() => {
    let results = opportunities.filter((item) => {
      if (section.kind && item.kind !== section.kind) return false;
      if (!section.kind && path === '/opportunities' && selectedChip !== 'All' && item.category !== selectedChip) return false;
      if (location !== 'All locations' && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (mode !== 'All work modes' && item.mode !== mode) return false;
      const searchText = `${item.title} ${item.company} ${item.category} ${item.tags.join(' ')} ${item.location}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    if (sort === 'Newest') {
      const ageInDays = (posted: string) => posted.toLowerCase().includes('today') ? 0 : posted.toLowerCase().includes('week') ? 7 * (Number.parseInt(posted, 10) || 1) : Number.parseInt(posted, 10) || 0;
      results = [...results].sort((a, b) => ageInDays(a.posted) - ageInDays(b.posted));
    }
    if (sort === 'Compensation: high to low') {
      const annualizedValue = (label: string) => {
        const match = label.match(/[0-9][0-9,]*(?:\.[0-9]+)?/);
        const amount = match ? Number(match[0].replace(/,/g, '')) : 0;
        return label.toLowerCase().includes('lpa') ? amount * 100000 : label.toLowerCase().includes('/ month') ? amount * 12 : amount;
      };
      results = [...results].sort((a, b) => annualizedValue(b.compensation) - annualizedValue(a.compensation));
    }
    if (sort === 'Closing soon') results = [...results].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return results;
  }, [location, mode, path, query, section.kind, selectedChip, sort]);
  const filteredPortals = governmentResources.filter((resource) => `${resource.name} ${resource.description} ${resource.category}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="opportunity-page">
    <section className={`opportunity-hero opportunity-hero-${section.accent}`}><div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> {section.badge}</div><h1>{section.title}</h1><p>{section.subtitle}</p><div className="hero-mini-proof"><span><CheckCircle2 size={15} /> Verified listings</span><span><Users size={15} /> Built for students</span></div></div><div className="hero-illustration" aria-hidden="true"><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/><div className="hero-folder"><BriefcaseBusiness size={50} /></div><span className="hero-floating hero-float-one"><Sparkles size={17} /></span><span className="hero-floating hero-float-two"><GraduationCap size={19} /></span><span className="hero-floating hero-float-three"><Check size={18} /></span></div>
      <div className="hero-search-card"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Role, company or skill" aria-label="Search by role, company or skill" /><span className="hero-search-divider" /><MapPin size={18} /><select aria-label="Search location" value={location} onChange={(event) => setLocation(event.target.value)}><option>All locations</option><option>Bengaluru</option><option>Hyderabad</option><option>New Delhi</option><option>Chennai</option><option>Remote</option></select><button onClick={() => document.getElementById('opportunity-list')?.scrollIntoView({ behavior: 'smooth' })}>Find opportunities <ArrowRight size={16} /></button></div>
    </section>

    {isGovernment ? <section className="portal-directory"><div className="portal-summary"><div><span className="eyebrow"><Landmark size={14} /> TRUSTED PUBLIC RESOURCES</span><h2>One place to find official programmes</h2><p>Explore student-facing services from national and state institutions. Always confirm dates and eligibility on the official portal.</p></div><div className="directory-stats"><span><b>6</b> portals</span><span><b>4</b> categories</span></div></div><div className="portal-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programmes or portals" aria-label="Search government portals" /></div><div className="portal-grid">{filteredPortals.map((resource) => <PortalCard key={resource.name} resource={resource} actions={actions} />)}</div></section> : <>
      <div className="opportunity-category-tabs">{['/opportunities', '/internships', '/jobs', '/hackathons', '/scholarships', '/courses'].map((route) => <button key={route} className={path === route ? 'active' : ''} onClick={() => actions.navigate(route)}>{route === '/opportunities' ? 'For you' : route.slice(1).replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</button>)}</div>
      <div className="opportunity-section-head"><div><span className="eyebrow">CURATED FOR YOUR NEXT STEP</span><h2>{section.kind === 'Internship' ? 'Internships worth exploring' : section.kind === 'Full-time' ? 'Early-career roles' : section.kind === 'Hackathon' ? 'Challenges to build with' : section.kind === 'Scholarship' ? 'Scholarships & fellowships' : section.kind === 'Course' ? 'Popular learning paths' : 'Explore opportunities'}</h2><p>Verified by organizations and selected for students like you.</p></div><div className="opportunity-view-actions"><button className={filtersVisible ? 'active' : ''} onClick={() => setFiltersVisible((visible) => !visible)} aria-expanded={filtersVisible}><Filter size={15} /> {filtersVisible ? 'Hide filters' : 'Show filters'}</button><SelectControl label="Sort" value={sort} onChange={setSort} options={['Recommended', 'Newest', 'Closing soon', 'Compensation: high to low']} /></div></div>
      {path === '/courses' && <LearningPathCards toast={actions.toast} />}
      <div className={`opportunity-filter-row ${filtersVisible ? '' : 'filters-collapsed'}`}>{path === '/opportunities' && chips.map((chip) => <button key={chip} className={selectedChip === chip ? 'active' : ''} onClick={() => setSelectedChip(chip)}>{chip}</button>)}<SelectControl label="Location" value={location} onChange={setLocation} options={['All locations', 'Bengaluru', 'Hyderabad', 'New Delhi', 'Chennai', 'Remote']} /><SelectControl label="Work mode" value={mode} onChange={setMode} options={['All work modes', 'Remote', 'Hybrid', 'On-site']} /><button className="clear-filters" onClick={() => { setQuery(''); setLocation('All locations'); setMode('All work modes'); setSelectedChip('All'); setSort('Recommended'); }}>Clear all</button></div>
      <div className="opportunity-count-row" id="opportunity-list"><span><b>{filteredItems.length}</b> opportunities match your search</span><span><ShieldCheck size={15} /> Every listing is reviewed</span></div>
      {filteredItems.length ? <div className="opportunity-grid">{filteredItems.map((item) => <OpportunityCard key={item.id} item={item} actions={actions} />)}</div> : <EmptyState title="No opportunities found" body="Try changing the search or removing a filter to see more options." action={<SoftButton onClick={() => { setQuery(''); setLocation('All locations'); setMode('All work modes'); }}>Reset filters</SoftButton>} />}
      <div className="browse-inspiration"><span className="inspiration-icon"><Lightbulb size={21} /></span><div><b>Not sure where to begin?</b><p>Explore a learning path, then save the roles that feel right for you.</p></div><SoftButton onClick={() => actions.navigate('/courses')}>Browse courses <ArrowRight size={15} /></SoftButton></div>
    </>}
  </div>;
}

export function LoginPage({ navigate }: AppActions) {
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const enterDemo = (event: React.FormEvent<HTMLFormElement>, role: 'student' | 'organization') => {
    event.preventDefault();
    const email = role === 'student' ? studentEmail : orgEmail;
    const password = role === 'student' ? studentPassword : orgPassword;
    if (!email || !password) { setNotice('Enter an email and password to open this demo workspace.'); return; }
    setNotice(`${role === 'student' ? 'Student' : 'Organization'} demo access confirmed. Opening your workspace…`);
    window.setTimeout(() => navigate(role === 'student' ? '/dashboard' : '/organization/company'), 650);
  };

  return <div className="login-page">
    <header className="login-header"><button className="brand-lockup" onClick={() => navigate('/dashboard')}><span className="brand-mark"><GraduationCap size={31} /></span><span className="brand-name">UniHub <b>AI</b></span></button><div className="login-header-links"><span>New to UniHub?</span><button onClick={() => navigate('/dashboard')}>Explore the student hub <ArrowRight size={15} /></button></div></header>
    <div className="login-content"><div className="login-welcome"><span className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</span><h1>One hub for<br /><em>everything you’re becoming.</em></h1><p>Find opportunities, connect with your campus community and make progress you can see.</p><div className="login-trust-row"><span><CheckCircle2 size={16} /> Verified opportunities</span><span><Users size={16} /> Student-first community</span></div></div>
      <div className="login-panels">
        <section className="login-panel student-login-panel"><div className="login-panel-icon student-panel-icon"><GraduationCap size={24} /></div><div className="login-panel-heading"><div><span className="eyebrow">FOR STUDENTS</span><h2>Student login</h2></div><span className="panel-number">01</span></div><p>Continue your journey with your student profile.</p><form onSubmit={(event) => enterDemo(event, 'student')}><label>University email<input type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} placeholder="you@university.edu" required /></label><label>Password<div className="password-wrap"><input type="password" value={studentPassword} onChange={(event) => setStudentPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" aria-label="Password visibility" onClick={(event) => { const input = event.currentTarget.parentElement?.querySelector('input'); if (input) input.type = input.type === 'password' ? 'text' : 'password'; }}><Eye size={17} /></button></div></label><div className="login-form-options"><label className="remember-check"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button" onClick={() => setNotice('Password reset instructions will be sent to your university email in a connected service.')}>Forgot password?</button></div><PrimaryButton type="submit">Sign in as a student <ArrowRight size={16} /></PrimaryButton></form><div className="login-panel-foot">Need a student account? <button onClick={() => setNotice('Student registration is ready to connect to your university email.')}>Create one</button></div></section>
        <section className="login-panel organization-login-panel"><div className="login-panel-icon org-panel-icon"><Building2 size={24} /></div><div className="login-panel-heading"><div><span className="eyebrow">FOR INSTITUTIONS & TEAMS</span><h2>Organization login</h2></div><span className="panel-number">02</span></div><p>Manage your campus, hiring or event workspace.</p><form onSubmit={(event) => enterDemo(event, 'organization')}><label>Work email<input type="email" value={orgEmail} onChange={(event) => setOrgEmail(event.target.value)} placeholder="name@organization.org" required /></label><label>Password<div className="password-wrap"><input type="password" value={orgPassword} onChange={(event) => setOrgPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" aria-label="Password visibility" onClick={(event) => { const input = event.currentTarget.parentElement?.querySelector('input'); if (input) input.type = input.type === 'password' ? 'text' : 'password'; }}><Eye size={17} /></button></div></label><div className="login-form-options"><span className="secure-label"><ShieldCheck size={15} /> Verified workspace</span><button type="button" onClick={() => setNotice('Contact your organization administrator to reset access.')}>Need help?</button></div><PrimaryButton type="submit" className="org-signin-button">Sign in to your workspace <ArrowRight size={16} /></PrimaryButton></form><div className="login-panel-foot">New organization? <button onClick={() => setNotice('Organization onboarding is available in this demo as a guided form.')}>Request access</button></div></section>
      </div>
      {notice && <div className="login-notice" role="status"><span><CheckCircle2 size={16} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
      <div className="login-demo-note"><ShieldCheck size={15} /> Frontend demo only · your credentials are not sent or stored.</div>
    </div><footer className="login-footer"><span>© 2026 UniHub AI</span><span>Learning today for a brighter tomorrow</span><button onClick={() => navigate('/settings')}>Privacy</button></footer>
  </div>;
}

export function ToolsPage({ path }: AppActions & { path: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All tools');
  const [activeTool, setActiveTool] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState('');
  const isHub = path === '/ai-hub';
  const visibleTools = aiTools.filter((tool) => (category === 'All tools' || tool.tag === category) && `${tool.name} ${tool.detail} ${tool.tag}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="tools-page">
    <PageHeading eyebrow={isHub ? 'AI HUB · YOUR PERSONAL WORKSPACE' : 'AI TOOLS · MADE FOR STUDENT LIFE'} title={isHub ? 'Your ideas, with a little more momentum.' : 'Tools to make the next step easier.'} description={isHub ? 'A focused space to brainstorm, practice and plan your learning and career journey.' : 'Practical AI-powered helpers for job search, study planning and creative work.'} action={<Chip tone="teal"><Sparkles size={14} /> Student toolkit</Chip>} />
    <section className="ai-feature-banner"><div className="ai-feature-icon"><Sparkles size={25} /></div><div><span className="eyebrow">YOUR PERSONAL AI WORKSPACE</span><h2>Start with a goal. Leave with a plan.</h2><p>Choose a tool and give it a little context. This frontend demo shows a sample result locally.</p></div><div className="ai-feature-art"><span><Lightbulb size={26} /></span><i /><i /><i /></div></section>
    <div className="tools-toolbar"><SearchField value={query} onChange={setQuery} label="Search AI tools" placeholder="Search tools or a goal" /><div className="tool-categories">{['All tools', 'Career', 'Writing', 'Learning', 'Ideas'].map((value) => <button className={category === value ? 'active' : ''} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div></div>
    <div className="tools-grid">{visibleTools.map((tool) => <article className="tool-card" key={tool.name}><div className={`tool-icon tool-${tool.tone}`}>{tool.icon === 'file' ? <FileText size={22} /> : tool.icon === 'sparkle' ? <Sparkles size={22} /> : tool.icon === 'edit' ? <PenLine size={22} /> : tool.icon === 'calendar' ? <CalendarDays size={22} /> : tool.icon === 'target' ? <Target size={22} /> : <Lightbulb size={22} />}</div><div className="tool-card-meta"><Chip tone={tool.tone}>{tool.tag}</Chip><span>4–8 min</span></div><h3>{tool.name}</h3><p>{tool.detail}</p><button className="tool-launch" onClick={() => { setActiveTool(tool.name); setPrompt(''); setGenerated(''); }}>Open tool <ArrowRight size={16} /></button></article>)}</div>
    <section className="ai-privacy-note"><ShieldCheck size={18} /><div><b>Your work stays yours</b><p>Use sample prompts in the demo. Inputs are only held in this page state and are not sent to a service.</p></div><span>Frontend demo</span></section>
    {activeTool && <Modal title={activeTool} subtitle="Add a little context to see a sample response." onClose={() => setActiveTool('')}><div className="modal-form"><label>What are you working toward?<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: I’m a final-year CS student applying for product internships…" rows={4} /></label><PrimaryButton onClick={() => setGenerated(prompt.trim() ? `A strong next step for this goal is to define one concrete outcome and pair it with a small weekly action. For your profile, highlight your ${prompt.toLowerCase().includes('design') ? 'design projects and user research' : 'relevant projects, practical skills and learning progress'}; then tailor one short example to each opportunity.` : 'Add a goal or a little context above so the response can be useful.')}>Create a sample response <Sparkles size={16} /></PrimaryButton>{generated && <div className="generated-response"><span className="eyebrow">SAMPLE RESULT · DEMO</span><p>{generated}</p></div>}</div></Modal>}
  </div>;
}

export function DiscoveryPage({ path, ...actions }: AppActions & { path: string }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [sort, setSort] = useState('Recommended');
  const [followed, setFollowed] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const isOrgs = path === '/organizations';
  const filteredColleges = colleges.filter((college) => `${college.name} ${college.city} ${college.type} ${college.focus}`.toLowerCase().includes(query.toLowerCase()) && (city === 'All cities' || college.city.toLowerCase().includes(city.toLowerCase()))).sort((a, b) => sort === 'Most programmes' ? Number.parseInt(b.courses.replace(/\D/g, ''), 10) - Number.parseInt(a.courses.replace(/\D/g, ''), 10) : sort === 'Top rated' ? Number(b.score) - Number(a.score) : 0);
  const filteredOrgs = organizations.filter((org) => `${org.name} ${org.category} ${org.location}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'Most openings' ? b.openings - a.openings : sort === 'A–Z' ? a.name.localeCompare(b.name) : 0);
  const results = isOrgs ? filteredOrgs : filteredColleges;
  return <div className="discovery-page"><div className="discovery-hero"><div><span className="eyebrow"><Compass size={14} /> {isOrgs ? 'MEET THE TEAMS SHAPING YOUR FUTURE' : 'FIND YOUR CAMPUS COMMUNITY'}</span><h1>{isOrgs ? 'Discover organizations worth knowing.' : 'Find a place to learn, grow and belong.'}</h1><p>{isOrgs ? 'Explore verified companies, institutions and student-first organizations.' : 'Compare campuses by location, learning community and the programmes that inspire you.'}</p></div><div className="discovery-hero-symbol"><Landmark size={34} /><span /><i /></div></div>
    <div className="discovery-tools"><SearchField value={query} onChange={setQuery} label={isOrgs ? 'Search organizations' : 'Search colleges'} placeholder={isOrgs ? 'Search a company or organization' : 'Search a college, city or programme'} />{!isOrgs && <SelectControl label="City" value={city} onChange={setCity} options={['All cities', 'Bengaluru', 'Chennai', 'New Delhi', 'Pilani', 'Sangareddy', 'Visakhapatnam']} />}<SelectControl label="Sort" value={sort} onChange={setSort} options={isOrgs ? ['Recommended', 'Most openings', 'A–Z'] : ['Recommended', 'Most programmes', 'Top rated']} /><span className="result-pill">{results.length} results</span></div>
    {isOrgs ? <div className="organization-grid">{filteredOrgs.map((org) => <article className="organization-card" key={org.name}><div className="organization-card-top"><BrandMark label={org.short} tone={org.accent} large /><span className="verified-badge"><ShieldCheck size={14} /> Verified</span></div><div className="eyebrow">{org.category}</div><h3>{org.name}</h3><p><MapPin size={15} /> {org.location}</p><div className="organization-foot"><span><BriefcaseBusiness size={15} /> {org.openings} open roles</span><button className="organization-profile-link" onClick={() => setSelectedProfile(org.name)}>View profile</button><button className={followed.includes(org.name) ? 'is-following' : ''} onClick={() => { setFollowed((items) => items.includes(org.name) ? items.filter((value) => value !== org.name) : [...items, org.name]); actions.toast(followed.includes(org.name) ? `Unfollowed ${org.name}` : `Following ${org.name}`); }}>{followed.includes(org.name) ? 'Following' : 'Follow'} {followed.includes(org.name) && <Check size={14} />}</button></div></article>)}</div> : <div className="college-grid">{filteredColleges.map((college) => <article className="college-card" key={college.name}><div className={`college-banner college-${college.accent}`}><span className="college-monogram">{college.short}</span><button className={actions.savedIds.includes(`college-${college.name}`) ? 'college-saved' : ''} aria-label={actions.savedIds.includes(`college-${college.name}`) ? `Remove ${college.name} from saved` : `Save ${college.name}`} onClick={() => actions.toggleSaved(`college-${college.name}`)}><Bookmark size={17} fill={actions.savedIds.includes(`college-${college.name}`) ? 'currentColor' : 'none'} /></button></div><div className="college-card-content"><div className="college-rating"><span><Star size={14} fill="currentColor" /> {college.score}</span><Chip>{college.type}</Chip></div><h3>{college.name}</h3><p><MapPin size={15} /> {college.city}</p><div className="college-focus">{college.focus}</div><div className="college-stats"><span><Users size={15} /> {college.students} students</span><span><BookOpen size={15} /> {college.courses}</span></div><button className="college-view" onClick={() => setSelectedProfile(college.name)}>Explore college <ArrowRight size={15} /></button></div></article>)}</div>}
    {results.length === 0 && <EmptyState title="Nothing found just yet" body="Try a different name, city or study area." action={<SoftButton onClick={() => { setQuery(''); setCity('All cities'); setSort('Recommended'); }}>Clear search</SoftButton>} />}
    {selectedProfile && <Modal title={selectedProfile} subtitle="Organization profile · Demo information" onClose={() => setSelectedProfile('')}>
      {(() => {
        const college = colleges.find((item) => item.name === selectedProfile);
        if (college) return <div className="discovery-profile-detail"><div className="discovery-profile-facts"><span><b>Location</b>{college.city}</span><span><b>Institution</b>{college.type}</span><span><b>Programmes</b>{college.courses}</span><span><b>Student community</b>{college.students}</span></div><p>{college.focus} · Student clubs, campus events and career pathways are represented in this sample profile.</p><div className="discovery-profile-actions"><SoftButton onClick={() => { setSelectedProfile(''); actions.navigate('/events/festivals'); }}>Campus events</SoftButton><PrimaryButton onClick={() => { setSelectedProfile(''); actions.navigate('/opportunities'); }}>Explore opportunities <ArrowRight size={15} /></PrimaryButton></div></div>;
        const org = organizations.find((item) => item.name === selectedProfile);
        if (!org) return null;
        return <div className="discovery-profile-detail"><div className="discovery-profile-facts"><span><b>Sector</b>{org.category}</span><span><b>Locations</b>{org.location}</span><span><b>Open roles</b>{org.openings} student opportunities</span><span><b>Organization status</b>Verified on UniHub</span></div><p>Explore current openings, programmes and events from {org.name}. The information shown here is sample content for the frontend prototype.</p><div className="discovery-profile-actions"><SoftButton onClick={() => { setFollowed((items) => items.includes(org.name) ? items : [...items, org.name]); actions.toast(`Following ${org.name}`); }}>Follow organization</SoftButton><PrimaryButton onClick={() => { setSelectedProfile(''); actions.navigate('/opportunities'); }}>Browse open roles <ArrowRight size={15} /></PrimaryButton></div></div>;
      })()}
    </Modal>}
    <div className="discovery-footer-note"><Sparkles size={17} /><span>Profiles are curated to help you make informed next steps.</span><button onClick={() => actions.navigate('/events')}>Explore campus events <ArrowRight size={15} /></button></div>
  </div>;
}

const communityPosts = [
  { id: 'post-1', name: 'Meera Shah', role: 'UX Designer · IIT Bombay', initials: 'MS', color: 'purple', time: '2h ago', content: 'Wrapped up my first accessibility audit today. The smallest contrast change made the biggest difference for one of our student testers. Sharing a few learnings soon!', tags: ['Accessibility', 'Design learning'], likes: 28, comments: 6 },
  { id: 'post-2', name: 'Arjun Nair', role: 'Computer Science · PES University', initials: 'AN', color: 'blue', time: 'Yesterday', content: 'Our team made it to the final round of GITAM HackFest! Three weeks ago we only had a sketch. If you’re building a sustainability idea for campus, let’s connect.', tags: ['Hackathon', 'Sustainability'], likes: 41, comments: 12 },
  { id: 'post-3', name: 'Fatima Khan', role: 'Data Science · Osmania University', initials: 'FK', color: 'pink', time: '2 days ago', content: 'Finished my first Power BI dashboard and earned a certificate. Thank you to everyone who answered my beginner questions — I’m happy to share the learning path.', tags: ['Data', 'Learning win'], likes: 19, comments: 4 },
];

function PersonAvatar({ initials, color }: { initials: string; color: string }) { return <span className={`person-avatar avatar-${color}`}>{initials}</span>; }

export function CommunityPage({ path, toast, navigate }: AppActions & { path: string }) {
  const [liked, setLiked] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>(['Fatima Khan']);
  const [composeText, setComposeText] = useState('');
  const [posted, setPosted] = useState<string[]>(['Shared a first look at my campus accessibility map — looking for classmates to test the route planner.']);
  const [selectedChat, setSelectedChat] = useState('Meera Shah');
  const [draftMessage, setDraftMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [peopleFilter, setPeopleFilter] = useState('Suggested for you');
  const isConnections = path === '/connections';
  const isMessages = path === '/messages';
  const isPosts = path === '/posts';
  const title = isConnections ? 'Build your student network' : isMessages ? 'Your conversations' : isPosts ? 'Your community posts' : 'Community starts with a hello.';
  const visibleCommunityPosts = isPosts ? [] : communityPosts;
  const visiblePeople = people.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(search.toLowerCase()) && (peopleFilter !== 'Your connections' || connections.includes(person.name))).sort((a, b) => peopleFilter === 'Recently active' ? a.activeMinutes - b.activeMinutes : peopleFilter === 'Suggested for you' ? b.mutual - a.mutual : a.name.localeCompare(b.name));
  const toggleConnect = (name: string) => { setConnections((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]); toast(connections.includes(name) ? `Removed ${name} from connections` : `Connection request sent to ${name}`); };

  if (isMessages) return <div className="messages-page"><PageHeading eyebrow="YOUR CAMPUS COMMUNITY" title="Messages" description="Keep the useful conversations going." action={<PrimaryButton onClick={() => toast('New message panel is ready to open')}> <PenLine size={16} /> New message</PrimaryButton>} /><div className="messaging-shell"><aside className="conversation-list"><div className="conversation-search"><Search size={17} /><input placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} /></div>{people.filter((person) => person.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map((person, index) => <button className={`conversation-item ${selectedChat === person.name ? 'active' : ''}`} key={person.name} onClick={() => setSelectedChat(person.name)}><PersonAvatar initials={person.initials} color={person.color} /><span><b>{person.name}</b><small>{index === 0 ? 'Are you joining the event…' : 'Thanks for sharing that!'}</small></span><time>{index === 0 ? '10:42' : 'Yesterday'}</time></button>)}</aside><section className="chat-window"><div className="chat-header"><PersonAvatar initials={people.find((person) => person.name === selectedChat)?.initials ?? 'MS'} color={people.find((person) => person.name === selectedChat)?.color ?? 'purple'} /><div><b>{selectedChat}</b><span><i /> Connected on UniHub</span></div><button onClick={() => toast(`Viewing ${selectedChat} profile`)}><Eye size={18} /></button></div><div className="chat-body"><div className="chat-date-divider">TODAY</div><div className="chat-bubble received">Hi Ananya! I saw you’re exploring product and design roles. Are you joining the Hyderabad Product Meetup next week?<small>10:36 AM</small></div><div className="chat-bubble sent">Hey {selectedChat.split(' ')[0]}! Yes, I’ve saved it. Would love to meet there and hear more about your journey.<small>10:42 AM</small></div>{sentMessages.map((message, index) => <div className="chat-bubble sent" key={`${message}-${index}`}>{message}<small>Just now</small></div>)}</div><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); if (!draftMessage.trim()) return; setSentMessages((current) => [...current, draftMessage]); setDraftMessage(''); }}><input value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} placeholder="Write a message…" aria-label="Write a message" /><button type="button" onClick={() => setDraftMessage((value) => `${value} 👋`)} aria-label="Add a wave">☺</button><PrimaryButton type="submit"><Send size={16} /> Send</PrimaryButton></form></section></div></div>;

  if (isConnections) return <div className="connections-page"><PageHeading eyebrow="YOUR CAMPUS COMMUNITY" title={title} description="Connect with students and mentors who share your interests and ambitions." action={<Chip tone="blue"><Users size={15} /> 248 connections</Chip>} /><div className="connections-toolbar"><SearchField value={search} onChange={setSearch} label="Search people" placeholder="Search by name, course or university" /><SelectControl label="People" value={peopleFilter} onChange={setPeopleFilter} options={['Suggested for you', 'Your connections', 'Recently active']} /></div><div className="people-grid">{visiblePeople.map((person) => <article className="person-card" key={person.name}><button className="person-more" aria-label={`More about ${person.name}`} onClick={() => toast(`${person.name} profile details opened`)}>···</button><PersonAvatar initials={person.initials} color={person.color} /><h3>{person.name}</h3><p>{person.role}</p><span className="mutual-count">{person.mutual} mutual connections</span><button className={`connect-button ${connections.includes(person.name) ? 'connected' : ''}`} onClick={() => toggleConnect(person.name)}>{connections.includes(person.name) ? <><Check size={15} /> Connected</> : <><UserPlus size={15} /> Connect</>}</button><button className="message-link" onClick={() => navigate('/messages')}><MessageCircle size={15} /> Message</button></article>)}</div></div>;

  return <div className="community-page"><PageHeading eyebrow="STUDENT COMMUNITY" title={title} description={isPosts ? 'Your updates, learning wins and project milestones in one place.' : 'A student-first space to learn in public, find collaborators and celebrate progress.'} action={<PrimaryButton onClick={() => document.getElementById('compose-post')?.focus()}><PenLine size={16} /> Share an update</PrimaryButton>} />
    <div className="community-layout"><section className="community-feed-column"><div className="community-tabs"><button className={!isPosts ? 'active' : ''} onClick={() => navigate('/community')}>For you</button><button className={isPosts ? 'active' : ''} onClick={() => navigate('/posts')}>My posts</button><button onClick={() => navigate('/connections')}>Connections</button></div><form className="compose-post" onSubmit={(event) => { event.preventDefault(); if (!composeText.trim()) return; setPosted((current) => [composeText, ...current]); setComposeText(''); toast('Your update is now in the community feed'); }}><div className="compose-header"><img src="/assets/ananya-avatar.png" alt="" /><textarea id="compose-post" rows={2} value={composeText} onChange={(event) => setComposeText(event.target.value)} placeholder="Share something you’re learning or building…" /></div><div className="compose-footer"><button type="button" onClick={() => toast('Project photo attachment is available in the connected app')}><span className="compose-media">▧</span> Add a project</button><button type="button" onClick={() => toast('Add a campus event to your post')}><CalendarDays size={16} /> Campus moment</button><PrimaryButton type="submit" disabled={!composeText.trim()}>Post <ArrowRight size={15} /></PrimaryButton></div></form>{visibleCommunityPosts.map((post) => <article className="community-post" key={post.id}><div className="post-header"><PersonAvatar initials={post.initials} color={post.color} /><div><b>{post.name}</b><span>{post.role}</span></div><time>{post.time}</time><button onClick={() => toast('Post options opened')}>···</button></div><p className="post-content">{post.content}</p><div className="post-tags">{post.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div><div className="post-engagement"><span><Heart size={15} /> {post.likes + (liked.includes(post.id) ? 1 : 0)} appreciations</span><span><MessageCircle size={15} /> {post.comments} comments</span></div><div className="post-actions"><button className={liked.includes(post.id) ? 'liked' : ''} onClick={() => setLiked((current) => current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id])}><ThumbsUp size={17} /> Appreciate</button><button onClick={() => toast(`Commenting on ${post.name}’s update`)}><MessageCircle size={17} /> Comment</button><button onClick={() => toast('Post link copied to your clipboard')}><ArrowRight size={17} /> Share</button></div></article>)}{posted.map((content, index) => <article className="community-post own-post" key={`new-${index}`}><div className="post-header"><PersonAvatar initials="AR" color="teal" /><div><b>Ananya Reddy</b><span>Computer Science · GITAM University</span></div><time>Just now</time></div><p className="post-content">{content}</p><div className="post-actions"><button onClick={() => toast('Your post is visible to your community')}><ThumbsUp size={17} /> Appreciate</button><button onClick={() => toast('Comments opened')}><MessageCircle size={17} /> Comment</button></div></article>)}</section>
      <aside className="community-side-column"><article className="community-network-card"><span className="network-card-icon"><Users size={20} /></span><h3>Your network is growing</h3><p>Connect with students and mentors in your field.</p><div className="network-numbers"><span><b>248</b> connections</span><span><b>318</b> followers</span></div><SoftButton onClick={() => navigate('/connections')}>Find people <ArrowRight size={15} /></SoftButton></article><article className="community-people-card"><SectionHeader title="People to know" action={<TextButton onClick={() => navigate('/connections')}>See all</TextButton>} />{people.slice(0, 3).map((person) => <div className="mini-person" key={person.name}><PersonAvatar initials={person.initials} color={person.color} /><span><b>{person.name}</b><small>{person.role.split(' · ')[0]}</small></span><button aria-label={`Connect with ${person.name}`} onClick={() => toggleConnect(person.name)}>{connections.includes(person.name) ? <Check size={16} /> : <UserPlus size={16} />}</button></div>)}</article><article className="community-event-card"><div className="eyebrow">NEXT IN YOUR CITY</div><h3>Hyderabad Product Meetup</h3><p><CalendarDays size={15} /> Nov 12 · T-Hub, Madhapur</p><button onClick={() => navigate('/events')}>Explore event <ArrowRight size={15} /></button></article></aside></div>
  </div>;
}

export function StudentWorkspacePage({ path, ...actions }: AppActions & { path: string }) {
  const [filter, setFilter] = useState('All statuses');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [toggles, setToggles] = useState([true, true, false]);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const isApplications = path === '/applications';
  const isSaved = path === '/saved';
  const isRewards = path === '/rewards';
  const isNotifications = path === '/notifications';
  const isSettings = path === '/settings';
  const notificationItems = [
    { id: 'n1', icon: <BriefcaseBusiness size={19} />, tone: 'blue', title: 'Microsoft India invited you to interview', detail: 'AI & Data Science Intern · Choose an interview time by Nov 5.', time: '32 min ago' },
    { id: 'n2', icon: <MessageCircle size={19} />, tone: 'purple', title: 'Meera Shah sent you a message', detail: '“Are you joining the Hyderabad Product Meetup next week?”', time: '2 hours ago' },
    { id: 'n3', icon: <CalendarDays size={19} />, tone: 'orange', title: 'GITAM HackFest is coming up', detail: 'Your saved event begins in 7 days. Review the event details.', time: 'Yesterday' },
    { id: 'n4', icon: <Award size={19} />, tone: 'green', title: 'You earned 250 learning points', detail: 'Nice work completing React for Beginners.', time: 'Oct 28' },
  ];
  const shownNotifications = notificationItems.filter((item) => notificationFilter === 'All' || (notificationFilter === 'Unread' ? !readIds.includes(item.id) : readIds.includes(item.id)));

  if (isApplications) {
    const statuses = ['All statuses', 'Submitted', 'In review', 'Interview', 'Shortlisted'];
    const trackedRecords = applicationRecords.map((record) => {
      const opportunity = opportunities.find((item) => item.title === record.role);
      return opportunity && actions.appliedIds.includes(opportunity.id) ? { ...record, date: 'Today', status: 'Submitted' } : record;
    });
    const addedRecords = opportunities.filter((item) => actions.appliedIds.includes(item.id) && !applicationRecords.some((record) => record.role === item.title)).map((item) => ({ role: item.title, company: item.company, date: 'Today', status: 'Submitted', color: item.tone }));
    const allRecords = [...trackedRecords, ...addedRecords];
    const filteredRecords = allRecords.filter((item) => filter === 'All statuses' || item.status === filter);
    return <div className="student-workspace"><PageHeading eyebrow="YOUR CAREER JOURNEY" title="Applications" description="Keep every next step organized, from submitted to offer." action={<PrimaryButton onClick={() => actions.navigate('/opportunities')}><Search size={16} /> Find opportunities</PrimaryButton>} /><div className="application-summary-cards"><div><span>In progress</span><b>{allRecords.length}</b><small><i /> {addedRecords.length} added from your shortlist</small></div><div><span>Interviews</span><b>{allRecords.filter((item) => item.status === 'Interview').length}</b><small><i /> Keep an eye on next steps</small></div><div><span>Offers</span><b>{allRecords.filter((item) => item.status === 'Offer').length || 1}</b><small><i /> Your next milestone</small></div></div><div className="workspace-panel"><div className="workspace-panel-head"><div><h2>My applications</h2><p>Track status, company and recent activity.</p></div><SelectControl label="Status" value={filter} onChange={setFilter} options={statuses} /></div><div className="application-table-wrap"><table className="application-table"><thead><tr><th>Role & organization</th><th>Applied on</th><th>Status</th><th>Next step</th></tr></thead><tbody>{filteredRecords.map((record) => <tr key={record.role}><td><div className="table-role"><BrandMark label={record.company.slice(0, 1)} tone={record.color} /><span><b>{record.role}</b><small>{record.company}</small></span></div></td><td>{record.date}</td><td><Chip tone={record.color}>{record.status}</Chip></td><td><button className="table-action" onClick={() => actions.toast(`Opening ${record.company} application details`)}>View details <ChevronRight size={14} /></button></td></tr>)}</tbody></table></div>{filteredRecords.length === 0 && <EmptyState title="No applications in this stage" body="Choose another status or explore new opportunities." />}</div><div className="application-tip"><Lightbulb size={19} /><span><b>Keep your momentum:</b> a brief, thoughtful follow-up can help you stay on a recruiter’s radar.</span><button onClick={() => actions.toast('Follow-up tips opened')}>View tips</button></div></div>;
  }

  if (isSaved) {
    const savedItems = opportunities.filter((item) => actions.savedIds.includes(item.id));
    const savedEvents = events.filter((event) => actions.savedIds.includes(event.id));
    const savedColleges = colleges.filter((college) => actions.savedIds.includes(`college-${college.name}`));
    const totalSaved = savedItems.length + savedEvents.length + savedColleges.length;
    return <div className="student-workspace"><PageHeading eyebrow="YOUR SHORTLIST" title="Saved opportunities" description="A thoughtful shortlist makes the next step easier." action={<PrimaryButton onClick={() => actions.navigate('/opportunities')}><Search size={16} /> Explore more</PrimaryButton>} /><div className="saved-stats"><span><Bookmark size={18} /> <b>{totalSaved}</b> saved items</span><span>Saved on this device</span></div>{totalSaved ? <><div className="opportunity-grid saved-grid">{savedItems.map((item) => <OpportunityCard key={item.id} item={item} actions={actions} />)}</div>{savedEvents.length > 0 && <div className="saved-event-list"><h2>Saved events</h2>{savedEvents.map((event) => <div className="saved-event-row" key={event.id}><CalendarDays size={18} /><span><b>{event.title}</b><small>{event.date} · {event.city}</small></span><button onClick={() => actions.toggleSaved(event.id)}>Remove</button></div>)}</div>}{savedColleges.length > 0 && <div className="saved-event-list saved-college-list"><h2>Saved colleges</h2>{savedColleges.map((college) => <div className="saved-event-row" key={college.name}><GraduationCap size={18} /><span><b>{college.name}</b><small>{college.city} · {college.type}</small></span><button onClick={() => actions.navigate('/colleges')}>View profile</button><button onClick={() => actions.toggleSaved(`college-${college.name}`)}>Remove</button></div>)}</div>}</> : <EmptyState title="Your shortlist starts here" body="Save an internship, course, college or event and it will be easy to find here." action={<PrimaryButton onClick={() => actions.navigate('/opportunities')}>Explore opportunities <ArrowRight size={15} /></PrimaryButton>} />}</div>;
  }

  if (isRewards) return <div className="rewards-page"><PageHeading eyebrow="PROGRESS THAT PAYS FORWARD" title="Rewards for the work you put in." description="Earn points for learning, showing up and helping your student community grow." action={<Chip tone="orange"><Star size={15} fill="currentColor" /> 3,420 points</Chip>} /><section className="rewards-balance"><div><span className="eyebrow">YOUR POINTS BALANCE</span><strong>3,420 <small>pts</small></strong><p>You earned 480 points this month. Keep building your streak!</p><div className="rewards-progress"><span style={{ width: '68%' }} /></div><small>580 points to your next milestone · 4,000 pts</small></div><div className="rewards-balance-icon"><Gift size={43} /></div></section><SectionHeader title="Ways to use your points" subtitle="Redeem a little progress for something useful." /><div className="reward-options">{[{ title: 'Learning boost', points: '1,000 pts', detail: 'Course vouchers and certification support', icon: <BookOpen size={23} />, tone: 'blue' }, { title: 'Career-ready kit', points: '2,500 pts', detail: 'Resume review and interview practice session', icon: <BriefcaseBusiness size={23} />, tone: 'orange' }, { title: 'Community champion', points: '3,000 pts', detail: 'Unlock a mentorship circle invitation', icon: <Users size={23} />, tone: 'purple' }].map((item) => <article className="reward-card" key={item.title}><span className={`reward-icon ${item.tone}`}>{item.icon}</span><Chip tone={item.tone}>{item.points}</Chip><h3>{item.title}</h3><p>{item.detail}</p><button onClick={() => actions.toast(`You need ${item.points} to redeem ${item.title}`)}>View reward <ArrowRight size={15} /></button></article>)}</div><div className="reward-history workspace-panel"><SectionHeader title="Recent points activity" action={<TextButton onClick={() => actions.toast('Showing all reward activity')}>View history</TextButton>} />{[{ label: 'Completed React for Beginners', date: 'Oct 28, 2026', points: '+250 pts' }, { label: 'Shared a learning win with your community', date: 'Oct 23, 2026', points: '+80 pts' }, { label: 'Joined GITAM HackFest', date: 'Oct 16, 2026', points: '+150 pts' }].map((item) => <div className="reward-history-row" key={item.label}><span className="history-dot"><Check size={13} /></span><span><b>{item.label}</b><small>{item.date}</small></span><strong>{item.points}</strong></div>)}</div></div>;

  if (isNotifications) return <div className="student-workspace"><PageHeading eyebrow="STAY IN THE LOOP" title="Notifications" description="Your important updates, in one calm place." action={<SoftButton onClick={() => { setReadIds(notificationItems.map((item) => item.id)); actions.toast('All notifications marked as read'); }}>Mark all as read</SoftButton>} /><div className="notification-filter"><button className={notificationFilter === 'All' ? 'active' : ''} onClick={() => setNotificationFilter('All')}>All</button><button className={notificationFilter === 'Unread' ? 'active' : ''} onClick={() => setNotificationFilter('Unread')}>Unread <span>{notificationItems.filter((item) => !readIds.includes(item.id)).length}</span></button><button className={notificationFilter === 'Read' ? 'active' : ''} onClick={() => setNotificationFilter('Read')}>Read</button><button onClick={() => actions.navigate('/settings')}>Manage preferences <Settings size={15} /></button></div><div className="notification-list">{shownNotifications.length ? shownNotifications.map((item) => <button className={`notification-item ${readIds.includes(item.id) ? 'read' : ''}`} key={item.id} onClick={() => { setReadIds((current) => current.includes(item.id) ? current : [...current, item.id]); actions.toast(`Opened: ${item.title}`); }}><span className={`notification-icon ${item.tone}`}>{item.icon}</span><span className="notification-text"><b>{item.title}</b><span>{item.detail}</span><small>{item.time}</small></span>{!readIds.includes(item.id) && <i className="unread-dot" />}</button>) : <EmptyState title={notificationFilter === 'Unread' ? 'You are all caught up' : 'No read notifications yet'} body="New updates will appear here as you explore UniHub." />}</div></div>;

  if (isSettings) return <div className="student-workspace"><PageHeading eyebrow="YOUR SPACE, YOUR WAY" title="Settings" description="Manage the details and preferences that shape your UniHub experience." action={settingsSaved ? <Chip tone="green"><Check size={14} /> Changes saved</Chip> : null} /><div className="settings-layout"><aside className="settings-nav"><button className="active"><UserPlus size={17} /> Profile & account</button><button onClick={() => document.getElementById('preferences')?.scrollIntoView({ behavior: 'smooth' })}><Bell size={17} /> Notifications</button><button onClick={() => actions.toast('Privacy controls opened')}><ShieldCheck size={17} /> Privacy</button><button onClick={() => actions.toast('Accessibility preferences opened')}><Eye size={17} /> Accessibility</button></aside><form className="settings-form" onSubmit={(event) => { event.preventDefault(); setSettingsSaved(true); actions.toast('Your settings have been saved on this device'); }}><section className="settings-card"><h2>Account details</h2><p>These details help us personalize your opportunities.</p><div className="settings-fields"><label>Full name<input defaultValue="Ananya Reddy" /></label><label>Email address<input type="email" defaultValue="ananya@gitam.edu" /></label><label>University<input defaultValue="GITAM University" /></label><label>Study area<input defaultValue="Computer Science · Final Year" /></label></div></section><section className="settings-card" id="preferences"><h2>Notification preferences</h2><p>Choose which updates you would like to receive.</p>{['Opportunity matches and deadlines', 'Campus event reminders', 'Community messages and mentions'].map((label, index) => <label className="toggle-row" key={label}><span><b>{label}</b><small>{index === 0 ? 'Roles and application deadlines relevant to you.' : index === 1 ? 'Reminders for your saved events and meetups.' : 'Replies, messages and connection activity.'}</small></span><input type="checkbox" checked={toggles[index]} onChange={() => setToggles((items) => items.map((value, i) => i === index ? !value : value))} /></label>)}</section><PrimaryButton type="submit">Save settings <Check size={16} /></PrimaryButton></form></div></div>;

  return null;
}

type WorkspaceRow = { name: string; meta: string; status: string; value: string; section?: string };
type OrgConfig = { title: string; subtitle: string; role: string; lead: string; stats: [string, string, string][]; active: string; rows: WorkspaceRow[] };

const orgConfigs: Record<string, OrgConfig> = {
  '/organization/college': { title: 'College dashboard', subtitle: 'A clear view of student engagement, campus events and career readiness.', role: 'GITAM University · Campus workspace', lead: 'Good afternoon, Campus team', stats: [['Student profiles', '8,426', '+12% this term'], ['Active opportunities', '46', '8 closing soon'], ['Upcoming events', '12', 'Next · Nov 8'], ['Learning progress', '72%', '+8% this month']], active: 'Campus overview', rows: [{ name: 'GITAM HackFest 2026', meta: 'Campus event · Nov 08', status: 'Registration open', value: '246 students' }, { name: 'Career readiness week', meta: 'Learning pathway · Nov 18', status: 'In planning', value: '184 enrolled' }, { name: 'Industry mentorship circle', meta: 'Student programme · Nov 25', status: 'Applications open', value: '32 mentors' }] },
  '/organization/company': { title: 'Company dashboard', subtitle: 'Manage student hiring, campus visibility and your early-career pipeline.', role: 'Microsoft India · Employer workspace', lead: 'Good afternoon, Talent team', stats: [['Active opportunities', '28', '+4 this month'], ['Applications received', '1,284', '+18% this week'], ['Students shortlisted', '86', 'Across 6 roles'], ['Interview completion', '74%', '+6% this month']], active: 'Hiring overview', rows: [{ name: 'AI & Data Science Intern', meta: 'Internship · Hyderabad · Hybrid', status: 'Interviewing', value: '38 applicants' }, { name: 'Cloud Support Associate', meta: 'Full-time · Pune · On-site', status: 'Reviewing', value: '126 applicants' }, { name: 'Product Design Intern', meta: 'Internship · Bengaluru', status: 'Published', value: '94 applicants' }] },
  '/organization/events': { title: 'Event organizer dashboard', subtitle: 'Create experiences, manage registrations and stay connected with attendees.', role: 'GITAM HackFest · Organizer workspace', lead: 'Your next event is around the corner', stats: [['Event registrations', '246', '+42 this week'], ['Published events', '6', '2 upcoming'], ['Checked in', '184', '75% attendance'], ['Feedback score', '4.8 / 5', '+0.3 this season']], active: 'Event overview', rows: [{ name: 'GITAM HackFest 2026', meta: 'Hackathon · Nov 08 · Visakhapatnam', status: 'Registration open', value: '246 registered' }, { name: 'Campus to Career Fair', meta: 'Career fair · Nov 21 · Hyderabad', status: 'Draft agenda', value: '14 exhibitors' }, { name: 'Student showcase night', meta: 'Campus meetup · Dec 02', status: 'Planning', value: '4 partner teams' }] },
  '/admin': { title: 'Administrator dashboard', subtitle: 'Oversee platform activity, review content and support the student community.', role: 'UniHub AI · Platform administration', lead: 'Platform health at a glance', stats: [['Active student profiles', '42,680', '+9.4% this month'], ['Verified organizations', '1,284', '+64 this month'], ['Listings under review', '18', '6 need attention'], ['Event participation', '82%', '+3.2% this month']], active: 'Platform overview', rows: [{ name: 'New employer verification queue', meta: 'Organization review · 6 requests', status: 'Needs review', value: 'Updated 22 min ago' }, { name: 'Scholarship listing refresh', meta: 'Content quality · 4 items', status: 'In progress', value: 'Due today' }, { name: 'Community safety report', meta: 'Student community · 2 flags', status: 'Priority review', value: 'Updated 1 hour ago' }] },
};

export function OrganizationDashboardPage({ path, toast, navigate }: AppActions & { path: string }) {
  const config = orgConfigs[path] ?? orgConfigs['/admin'];
  const [active, setActive] = useState(config.active);
  const [createdRows, setCreatedRows] = useState<WorkspaceRow[]>([]);
  const [modalMode, setModalMode] = useState<'publish' | 'profile' | 'invite' | 'review' | ''>('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDetails, setDraftDetails] = useState('');
  const [workspaceName, setWorkspaceName] = useState(config.role.split(' · ')[0]);
  const [workspaceDescription, setWorkspaceDescription] = useState(config.subtitle);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [reviewTarget, setReviewTarget] = useState(config.rows[0].name);
  const [reviewDecision, setReviewDecision] = useState('In progress');
  const [reviewStates, setReviewStates] = useState<Record<string, string>>({});
  const [rowDetails, setRowDetails] = useState<WorkspaceRow | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const sideNav = path === '/organization/college' ? ['Campus overview', 'Students', 'Opportunities', 'Events', 'Learning programmes'] : path === '/organization/company' ? ['Hiring overview', 'Opportunities', 'Applicants', 'Interviews', 'Company profile'] : path === '/organization/events' ? ['Event overview', 'Events', 'Attendees', 'Promotion', 'Feedback'] : ['Platform overview', 'Organizations', 'Listings', 'Community review', 'Reports'];
  const primaryAction = path === '/organization/events' ? 'Create event' : path === '/organization/college' ? 'Add campus opportunity' : path === '/admin' ? 'Review queue' : 'Create opportunity';
  const contextRows: WorkspaceRow[] = active === config.active ? config.rows
    : active.toLowerCase().includes('student') || active.toLowerCase().includes('attendee') ? people.map((person) => ({ name: person.name, meta: person.role, status: 'Active student', value: `${person.mutual} mutual connections` }))
    : active.toLowerCase().includes('opportunit') || active.toLowerCase().includes('listing') ? opportunities.map((item) => ({ name: item.title, meta: `${item.kind} · ${item.company} · ${item.location}`, status: 'Published', value: item.compensation }))
    : active.toLowerCase().includes('event') || active.toLowerCase().includes('promotion') ? events.map((event) => ({ name: event.title, meta: `${event.type} · ${event.date} · ${event.city}`, status: 'Registration open', value: `${event.attendees} registered` }))
    : active.toLowerCase().includes('learning') ? learningCourses.map((course) => ({ name: course.title, meta: course.provider, status: course.label, value: `${course.progress}% complete` }))
    : active.toLowerCase().includes('applicant') || active.toLowerCase().includes('interview') ? applicationRecords.map((record) => ({ name: record.role, meta: `${record.company} · applied ${record.date}`, status: record.status, value: 'View application' }))
    : active.toLowerCase().includes('organization') ? organizations.map((org) => ({ name: org.name, meta: `${org.category} · ${org.location}`, status: 'Verified', value: `${org.openings} open roles` }))
    : active.toLowerCase().includes('community') ? communityPosts.map((post) => ({ name: post.name, meta: post.role, status: 'Community post', value: `${post.likes} appreciations` }))
    : active.toLowerCase().includes('company profile') ? [{ name: workspaceName, meta: workspaceDescription, status: 'Verified workspace', value: 'Profile strength · 92%' }]
    : config.rows;
  const visibleRows = [...createdRows.filter((row) => row.section === active), ...contextRows].map((row) => ({ ...row, status: reviewStates[row.name] ?? row.status }));
  const displayRows = showAllRows ? visibleRows : visibleRows.slice(0, 3);
  const activityTitle = active === config.active ? path === '/admin' ? 'Needs your attention' : path === '/organization/events' ? 'Your event pipeline' : path === '/organization/company' ? 'Active opportunities' : 'Campus activity' : active;
  const downloadInsights = () => {
    const csv = ['Metric,Value,Trend', ...config.stats.map(([label, value, trend]) => `"${label}","${value}","${trend}"`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `unihub-${path.split('/').filter(Boolean).join('-') || 'admin'}-insights.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Insights report downloaded');
  };
  const submitWorkspaceForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modalMode === 'publish' && draftTitle.trim()) {
      const row: WorkspaceRow = { name: draftTitle.trim(), meta: `${primaryAction} · ${draftDetails.trim() || 'Added from the workspace demo'}`, status: path === '/organization/events' ? 'Draft agenda' : path === '/admin' ? 'In review' : 'Draft', value: 'Created just now', section: active };
      setCreatedRows((current) => [row, ...current]);
      setDraftTitle('');
      setDraftDetails('');
      toast(`${row.name} was added to this workspace`);
    } else if (modalMode === 'profile') {
      toast('Workspace profile saved on this device');
    } else if (modalMode === 'invite' && inviteEmail.trim()) {
      setInvitedEmails((current) => current.includes(inviteEmail.trim()) ? current : [...current, inviteEmail.trim()]);
      toast(`Invitation prepared for ${inviteEmail.trim()}`);
      setInviteEmail('');
    } else if (modalMode === 'review') {
      setReviewStates((current) => ({ ...current, [reviewTarget]: reviewDecision }));
      toast(`${reviewTarget} marked ${reviewDecision.toLowerCase()}`);
    }
    setModalMode('');
  };

  return <div className="org-dashboard">
    <div className="org-topline"><span className="org-role-label"><Building2 size={15} /> {config.role}</span><div><button onClick={() => navigate('/notifications')} aria-label="Notifications"><Bell size={18} /></button><span className="org-user-avatar">U</span><span className="org-user-name">Workspace team</span></div></div>
    <PageHeading eyebrow="ORGANIZATION WORKSPACE" title={config.title} description={config.subtitle} action={<PrimaryButton onClick={() => setModalMode(path === '/admin' ? 'review' : 'publish')}><span>＋</span> {primaryAction}</PrimaryButton>} />
    <div className="org-welcome-banner"><div><span className="eyebrow">{active.toUpperCase()}</span><h2>{config.lead}</h2><p>Here’s what’s moving across your workspace this week.</p></div><div className="org-banner-art"><div><TrendingUp size={24} /></div><span>+16.8%<small>engagement</small></span></div></div>
    <div className="org-layout">
      <aside className="org-side-nav" aria-label="Workspace sections">{sideNav.map((item) => <button className={active === item ? 'active' : ''} key={item} onClick={() => { setActive(item); setShowAllRows(false); }}>{item === config.active ? <TrendingUp size={17} /> : item.toLowerCase().includes('student') || item === 'Applicants' || item === 'Attendees' ? <Users size={17} /> : item.toLowerCase().includes('event') ? <CalendarDays size={17} /> : item.toLowerCase().includes('learning') ? <BookOpen size={17} /> : item.toLowerCase().includes('review') || item === 'Reports' ? <ShieldCheck size={17} /> : <BriefcaseBusiness size={17} />}{item}{item.toLowerCase().includes('review') && <i className="side-nav-count">6</i>}</button>)}</aside>
      <div className="org-content">
        <div className="org-stats-grid">{config.stats.map(([label, value, trend], index) => <article className="org-stat" key={label}><span className={`org-stat-icon org-color-${index}`}><TrendingUp size={19} /></span><span>{label}</span><b>{value}</b><small>{trend}</small></article>)}</div>
        <section className="workspace-panel org-activity-panel" id="org-workspace-list"><div className="workspace-panel-head"><div><h2>{activityTitle}</h2><p>{active === config.active ? 'Recent updates from your workspace.' : `Review and manage ${active.toLowerCase()} using sample workspace data.`}</p></div><button className="table-action" onClick={() => setShowAllRows((current) => !current)}>{showAllRows ? 'Show less' : 'View all'} <ArrowRight size={14} /></button></div><div className="org-activity-list">{displayRows.map((row, index) => <article className="org-activity-row" key={`${row.name}-${index}`}><span className={`org-activity-symbol symbol-${index % 3}`}><BriefcaseBusiness size={18} /></span><div><b>{row.name}</b><small>{row.meta}</small></div><Chip tone={row.status.toLowerCase().includes('open') || row.status.includes('Published') || row.status === 'Verified' ? 'green' : row.status.toLowerCase().includes('review') || row.status.includes('Priority') ? 'orange' : 'blue'}>{row.status}</Chip><span className="org-activity-value">{row.value}</span><button aria-label={`View details for ${row.name}`} onClick={() => setRowDetails(row)}><ChevronRight size={17} /></button></article>)}</div>{visibleRows.length === 0 && <EmptyState title={`No ${active.toLowerCase()} yet`} body="Add a new item to start building this workspace section." />}</section>
        <div className="org-quick-actions"><button onClick={() => setModalMode('profile')}><Settings size={17} /> Manage workspace profile</button><button onClick={() => setModalMode('invite')}><UserPlus size={17} /> {invitedEmails.length ? `${invitedEmails.length} teammate invited` : 'Invite a teammate'}</button><button onClick={downloadInsights}><TrendingUp size={17} /> Download insights</button></div>
      </div>
    </div>
    {modalMode && <Modal title={modalMode === 'publish' ? primaryAction : modalMode === 'profile' ? 'Manage workspace profile' : modalMode === 'invite' ? 'Invite a teammate' : 'Review queue'} subtitle={modalMode === 'publish' ? 'Add a sample item to the current workspace using local demo state.' : modalMode === 'review' ? 'Choose a queue item and save a review decision.' : 'This form stays on this device in the frontend demo.'} onClose={() => setModalMode('')}><form className="modal-form" onSubmit={submitWorkspaceForm}>
      {modalMode === 'publish' && <><label>{path === '/organization/events' ? 'Event name' : 'Opportunity title'}<input required value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder={path === '/organization/events' ? 'e.g. Student project showcase' : 'e.g. Product design internship'} /></label><label>Details<textarea value={draftDetails} onChange={(event) => setDraftDetails(event.target.value)} rows={3} placeholder="Add a short summary, location or next step" /></label></>}
      {modalMode === 'profile' && <><label>Workspace name<input required value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} /></label><label>About this workspace<textarea value={workspaceDescription} onChange={(event) => setWorkspaceDescription(event.target.value)} rows={4} /></label></>}
      {modalMode === 'invite' && <><label>Teammate email<input required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@organization.in" /></label><p className="form-help">The invitation is represented in local demo state only; no email is sent.</p></>}
      {modalMode === 'review' && <><label>Queue item<select value={reviewTarget} onChange={(event) => setReviewTarget(event.target.value)}>{config.rows.map((row) => <option key={row.name}>{row.name}</option>)}</select></label><label>Decision<select value={reviewDecision} onChange={(event) => setReviewDecision(event.target.value)}><option>In progress</option><option>Resolved</option><option>Escalated</option></select></label><label>Review note<textarea value={draftDetails} onChange={(event) => setDraftDetails(event.target.value)} rows={3} placeholder="Add a private moderation note" /></label></>}
      <PrimaryButton type="submit">{modalMode === 'publish' ? 'Save to workspace' : modalMode === 'profile' ? 'Save profile' : modalMode === 'invite' ? 'Prepare invitation' : 'Save decision'} <Check size={15} /></PrimaryButton>
    </form></Modal>}
    {rowDetails && <Modal title={rowDetails.name} subtitle={rowDetails.meta} onClose={() => setRowDetails(null)}><div className="org-row-detail"><Chip tone={rowDetails.status.toLowerCase().includes('review') ? 'orange' : 'blue'}>{rowDetails.status}</Chip><p><b>Workspace value</b><span>{rowDetails.value}</span></p><p>{path === '/admin' ? 'Review this queue entry and keep the platform workspace up to date.' : 'This detail view is powered by local sample data for the frontend workspace.'}</p><div className="org-row-detail-actions"><SoftButton onClick={() => { setRowDetails(null); setModalMode(path === '/admin' ? 'review' : 'profile'); }}>Edit details</SoftButton>{path === '/admin' && <PrimaryButton onClick={() => { setReviewStates((current) => ({ ...current, [rowDetails.name]: 'Resolved' })); setRowDetails(null); toast(`${rowDetails.name} marked resolved`); }}>Mark resolved <Check size={15} /></PrimaryButton>}</div></div></Modal>}
  </div>;
}
