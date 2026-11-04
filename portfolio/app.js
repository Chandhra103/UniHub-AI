const pages = {
  home: { id: "screen-home", title: "Home" },
  about: { id: "screen-about", title: "About" },
  projects: { id: "screen-projects", title: "Projects" },
  experience: { id: "screen-experience", title: "Experience" },
  skills: { id: "screen-skills", title: "Skills" },
  thinking: { id: "screen-thinking", title: "My Thinking" },
  voice: { id: "screen-voice", title: "Voice & Creativity" },
  contact: { id: "screen-contact", title: "Contact" },
};
const internalAnchors = { intro: "home", journey: "about", "experience-timeline": "experience", universe: "skills", network: "thinking", workflow: "voice" };
const projectData = {
  unihub: {
    name: "UniHub-AI", initials: "UH", category: "Opportunity network", number: "01", accent: "#2454D6", image: "assets/project-icons/unihub.jpg", status: "In development",
    summary: "A student-focused concept for discovering opportunities, events, and communities in one place.",
    problem: "Student opportunities are often scattered across disconnected channels and difficult to track.",
    solution: "A unified discovery workspace with AI-assisted recommendations as a planned direction.",
    capabilities: ["Student dashboard", "Jobs & internships", "Hackathons", "College events", "AI recommendations"],
    repository: "https://github.com/Chandhra103/UniHub-AI",
    preview: { brand: "UniHub", nav: ["Discover", "Network", "Events"], greeting: "Good morning", title: "Your opportunity feed", stats: [["24", "Opportunities"], ["08", "Events"], ["12", "Connections"]], tiles: [["01", "Internship", "Recommended for you"], ["02", "Hackathon", "Recommended for you"], ["03", "Campus event", "Recommended for you"]] },
  },
  enersight: {
    name: "EnerSight-AI", initials: "ES", category: "Energy intelligence", number: "02", accent: "#169B78", image: "assets/project-icons/enersight.jpg", status: "Concept workspace",
    summary: "An energy monitoring and analytics interface concept focused on clear operational insight.",
    problem: "Energy information can be difficult to interpret when monitoring and analysis are fragmented.",
    solution: "A visual workspace concept combining overview, monitoring, analytics, and energy insights.",
    capabilities: ["Energy overview", "Visual analytics", "Energy insights", "Monitoring interface"],
    repository: "https://github.com/Chandhra103/EnerSight-AI",
    preview: { brand: "Energy overview", nav: ["Monitoring — Active", "Insights — Analysis", "Risk signals — Explore"], greeting: "Insight stream", title: "Overview and trends", stats: [["Active", "Monitoring"], ["Analysis", "Insights"], ["Explore", "Risk signals"]], tiles: [["01", "Overview", "Energy signals"], ["02", "Trends", "Comparative analysis"], ["03", "Monitoring", "Operational signals"]] },
  },
  devfix: {
    name: "DevFix AI", initials: "DF", category: "Developer tooling", number: "03", accent: "#7547E8", image: "assets/project-icons/devfix.jpg", status: "Concept workspace",
    summary: "A debugging workspace concept for moving from repository context to an explainable fix plan.",
    problem: "Investigating a defect across a codebase can require many disconnected tools and manual steps.",
    solution: "A focused investigation flow covering repository context, root cause, planning, and verification.",
    capabilities: ["Repository explorer", "Root-cause view", "Fix planning", "Approval workflow", "Verification results"],
    repository: "https://github.com/Chandhra103/devfix-ai",
    preview: { brand: "Repository", nav: ["src / components", "analysis.ts", "tests"], greeting: "Root cause investigation", title: "Concept preview", stats: [["Context", "Repository"], ["Cause", "Investigation"], ["Plan", "Verify"]], tiles: [["01", "async function", "investigate(issue)"], ["02", "const context", "await repository.scan()"], ["03", "return plan", "verify(context)"]] },
  },
  supermarket: {
    name: "SuperMarketDataAnalytics", initials: "SM", category: "Business analytics", number: "04", accent: "#E76C3C", image: "assets/project-icons/supermarket.jpg", status: "Concept workspace",
    summary: "A retail analytics workspace concept designed to surface sales patterns and business signals.",
    problem: "Retail data is less useful when decision-makers cannot quickly connect sales, product, and risk signals.",
    solution: "An executive dashboard concept that organizes analysis into focused decision areas.",
    capabilities: ["Executive summary", "Sales analysis", "Product analysis", "Business insights", "Risk analysis"],
    repository: "https://github.com/Chandhra103/SuperMarketDataAnalytics",
    preview: { brand: "BUSINESS INTELLIGENCE", nav: ["Sales view", "Overview", "Products", "Analysis", "Risk signals"], greeting: "Executive summary", title: "Concept preview", stats: [["Overview", "Sales view"], ["Explore", "Analysis"], ["Signals", "Risk" ]], tiles: [["01", "Sales analysis", "Overview and trends"], ["02", "Product analysis", "Comparative insights"], ["03", "Risk analysis", "Business signals"]] },
  },
  "ev-edge": {
    name: "Edge-AI EV Charging Optimizer", initials: "EV", category: "Edge AI · IoT", number: "05", accent: "#D7A014", image: "assets/project-icons/ev-edge.jpg", status: "Concept workspace",
    summary: "An EV charging operations concept for monitoring bays, power flow, and edge intelligence.",
    problem: "Charging sites need a clear view of bay activity and the relationship between demand and available power.",
    solution: "An IoT monitoring concept combining station status, power visualization, and optimization signals.",
    capabilities: ["Station overview", "Charging bays", "Demand & supply", "Energy optimization", "Edge AI concepts"],
    repository: "https://github.com/Chandhra103/Edge-AI-EV-Charging-Optimizer",
    preview: { brand: "Station network", nav: ["Charging operations", "Edge online", "Optimization"], greeting: "Active bays: 06 / 08", title: "Grid balance: Stable", stats: [["82%", "Bay 01"], ["64%", "Bay 02"], ["91%", "Bay 03"]], tiles: [["01", "Bay 01", "Charging"], ["02", "Bay 02", "Charging"], ["03", "Bay 04", "37%"]] },
  },
  campus: {
    name: "CampusEnergy Twin", initials: "CE", category: "Digital twin", number: "06", accent: "#178EAA", image: "assets/project-icons/campus.jpg", status: "Concept workspace",
    summary: "A campus-scale energy interface concept spanning buildings, monitoring, and sustainability insight.",
    problem: "Campus energy use is distributed across buildings, making performance difficult to understand at a glance.",
    solution: "A campus overview concept connecting building-level information with broader sustainability analysis.",
    capabilities: ["Campus overview", "Building information", "Energy visualization", "Sustainability insights", "Campus analytics"],
    repository: "https://github.com/Chandhra103/CampusEnergy-Twin",
    preview: { brand: "Campus overview", nav: ["B1 · B2 · B3", "B4 · B5", "Academic · Residential"], greeting: "Concept model", title: "Campus energy", stats: [["B1", "Academic"], ["B2", "Residential"], ["B3", "Shared facilities"]], tiles: [["01", "Buildings", "Information"], ["02", "Energy", "Visualization"], ["03", "Sustainability", "Insights"]] },
  },
};
let currentProjectKey = null;
let lastFocusedElement = null;

function pageForHash(hash) {
  if (pages[hash]) return hash;
  return internalAnchors[hash] || "home";
}
function syncRoute() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const page = pageForHash(hash);
  document.querySelectorAll(".screen").forEach(screen => { screen.hidden = screen.id !== pages[page].id; });
  document.title = `${pages[page].title} — B. Chandhra Shekhar`;
  if (internalAnchors[hash]) {
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}
function previewMarkup(preview) {
  return `<div class="concept-preview"><div class="concept-preview-top"><strong>${preview.brand}</strong><span>Visual concept — not a live product screen</span></div><div class="concept-preview-body"><div class="concept-nav"><strong>${preview.brand}</strong>${preview.nav.map(item => `<span>${item}</span>`).join("")}</div><div class="concept-main"><small>${preview.greeting}</small><h4>${preview.title}</h4><div class="concept-stats">${preview.stats.map(([value,label]) => `<div class="concept-stat"><b>${value}</b><span>${label}</span></div>`).join("")}</div><div class="concept-tiles">${preview.tiles.map(([num,title,note]) => `<div class="concept-tile"><small>${num}</small><strong>${title}</strong><small>${note}</small></div>`).join("")}</div></div></div></div>`;
}
function renderWorkspace(project) {
  const identity = document.getElementById("workspace-identity");
  identity.style.setProperty("--app-accent", project.accent);
  identity.innerHTML = `<span class="workspace-icon"><img src="${project.image}" alt="" /></span><small>Application ${project.number}</small><h2>${project.name}</h2><p>${project.category}</p>`;
  document.getElementById("workspace-toolbar-name").textContent = `${project.name} · Concept workspace`;
  const sideLink = document.getElementById("workspace-repo-side");
  sideLink.href = project.repository;
  const content = document.getElementById("workspace-content");
  content.innerHTML = `
    <section id="workspace-overview" class="workspace-section">
      <header class="workspace-hero"><div><p class="micro-label">${project.category} / ${project.number}</p><h1 id="workspace-title">${project.name}</h1><p>${project.summary}</p></div><span class="status-pill">${project.status}</span></header>
      <p class="workspace-section-label">Overview / ${project.number}</p><h3>Project overview</h3>
      <div class="concept-pair"><article><span>01</span><h4>Problem</h4><p>${project.problem}</p></article><article><span>02</span><h4>Solution direction</h4><p>${project.solution}</p></article></div>
    </section>
    <section id="workspace-interface" class="workspace-section"><p class="workspace-section-label">Interface / ${project.number}</p><h3>Application preview</h3><p>Visual concept — not a live product screen</p>${previewMarkup(project.preview)}</section>
    <section id="workspace-details" class="workspace-section"><p class="workspace-section-label">Capabilities / ${project.number}</p><h3>Interface directions</h3><p>These items describe the requested product direction. Consult the repository to verify current implementation.</p><ul class="capability-list">${project.capabilities.map(item => `<li>${item}<span>Concept</span></li>`).join("")}</ul>
      <div class="details-grid" style="margin-top:22px"><article><p class="workspace-section-label">Technologies</p><h3>Repository-verified stack</h3><p>Open the repository to view the current languages, frameworks, and dependencies.</p></article><article><p class="workspace-section-label">My contribution</p><h3>Project contribution</h3><p>Contribution details are intentionally deferred to the repository documentation.</p></article><article><p class="workspace-section-label">What I learned</p><h3>Learning notes</h3><p>Learning outcomes have not been provided and are not inferred here.</p></article></div>
      <a class="detail-link" href="${project.repository}" target="_blank" rel="noopener noreferrer">Explore the source — review verified implementation details on GitHub <span aria-hidden="true">↗</span></a>
    </section>`;
  document.querySelectorAll(".workspace-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.workspaceTab === "overview"));
}
function openProject(key) {
  const project = projectData[key];
  if (!project) return;
  currentProjectKey = key;
  lastFocusedElement = document.activeElement;
  renderWorkspace(project);
  const workspace = document.getElementById("project-workspace");
  workspace.hidden = false;
  workspace.setAttribute("aria-hidden", "false");
  workspace.classList.remove("is-minimized", "is-maximized");
  document.getElementById("minimized-project").hidden = true;
  document.body.classList.add("workspace-open");
  document.querySelector('[data-window="close"]').focus();
}
function closeProject() {
  const workspace = document.getElementById("project-workspace");
  workspace.hidden = true;
  workspace.setAttribute("aria-hidden", "true");
  document.getElementById("minimized-project").hidden = true;
  document.body.classList.remove("workspace-open");
  currentProjectKey = null;
  if (lastFocusedElement?.focus) lastFocusedElement.focus();
}
function handleWindowAction(action) {
  const workspace = document.getElementById("project-workspace");
  const minimized = document.getElementById("minimized-project");
  if (action === "close") closeProject();
  if (action === "minimize") {
    workspace.classList.add("is-minimized");
    workspace.setAttribute("aria-hidden", "true");
    minimized.hidden = false;
    document.getElementById("minimized-name").textContent = projectData[currentProjectKey]?.name || "Project";
    document.body.classList.remove("workspace-open");
    minimized.querySelector('[data-window="restore"]').focus();
  }
  if (action === "restore") {
    workspace.classList.remove("is-minimized");
    workspace.setAttribute("aria-hidden", "false");
    minimized.hidden = true;
    document.body.classList.add("workspace-open");
    document.querySelector('[data-window="minimize"]').focus();
  }
  if (action === "maximize") workspace.classList.toggle("is-maximized");
}

document.addEventListener("click", event => {
  const card = event.target.closest("[data-project]");
  if (card) openProject(card.dataset.project);
  const windowControl = event.target.closest("[data-window]");
  if (windowControl) handleWindowAction(windowControl.dataset.window);
  const tab = event.target.closest("[data-workspace-tab]");
  if (tab) {
    document.querySelectorAll(".workspace-tab").forEach(item => item.classList.toggle("is-active", item === tab));
    document.getElementById(`workspace-${tab.dataset.workspaceTab}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && currentProjectKey) closeProject();
  if (event.key === "Tab" && currentProjectKey) {
    const focusable = [...document.querySelectorAll("#project-workspace button:not([disabled]), #project-workspace a[href]")].filter(el => !el.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener("hashchange", syncRoute);
syncRoute();

/* ---------- Page 05 — Skills universe ---------- */
const skillCategories = { "Programming": "#FF8A24", "AI & ML": "#6E93FF", "Data": "#37C39A", "IoT": "#9B7BFF", "Development": "#F2C14E", "Personal": "#3FC1CE" };
const skillData = [
  { id: "python", name: "Python", category: "Programming", text: "My primary language for data analysis, automation and AI experiments — including the analytics work behind SuperMarketDataAnalytics." },
  { id: "fundamentals", name: "Programming Fundamentals", category: "Programming", text: "Logic, data structures and clean problem decomposition — the base every project I build stands on." },
  { id: "ai", name: "Artificial Intelligence", category: "AI & ML", text: "Exploring how intelligent systems reason and assist — from applied AI coursework to AI-assisted directions in my project ideas." },
  { id: "ml", name: "Machine Learning", category: "AI & ML", text: "Learning the core ML workflow: framing a problem, preparing data, training models and evaluating what they actually learned." },
  { id: "aitools", name: "AI Tools", category: "AI & ML", text: "Working with modern AI tools for prompting, prototyping and research — and using them to speed up every stage of building." },
  { id: "analytics", name: "Data Analytics", category: "Data", text: "Turning raw datasets into clear questions, patterns and decisions — practised in my IBM SkillsBuild internship and retail analytics project." },
  { id: "powerbi", name: "Power BI", category: "Data", text: "Building interactive dashboards that make business data readable at a glance." },
  { id: "dataviz", name: "Data Visualization", category: "Data", text: "Choosing honest, clear visuals so insights land with the people who need them." },
  { id: "esp32", name: "ESP32", category: "IoT", text: "My go-to microcontroller for IoT prototypes — sensors, Wi-Fi connectivity and edge experiments, used in my EV charging project." },
  { id: "mqtt", name: "MQTT", category: "IoT", text: "Lightweight messaging between devices — how my IoT projects keep stations, sensors and servers in sync." },
  { id: "embedded", name: "Embedded Systems", category: "IoT", text: "Understanding hardware and firmware together: writing code that meets the physical world." },
  { id: "web", name: "Web Technologies", category: "Development", text: "HTML, CSS and JavaScript — this portfolio itself is built by hand with them, no frameworks attached." },
  { id: "communication", name: "Communication", category: "Personal", text: "Explaining ideas simply — in writing, in presentations and in conversations. Voice-first, with Wispr Flow." },
  { id: "creativity", name: "Creativity", category: "Personal", text: "Looking for the angle nobody tried yet — then testing it." },
  { id: "problemsolving", name: "Problem Solving", category: "Personal", text: "Breaking big, fuzzy problems into small, buildable steps." },
];
function selectSkill(id) {
  const skill = skillData.find(item => item.id === id);
  if (!skill) return;
  const panel = document.getElementById("skill-panel-body");
  panel.innerHTML = `<span class="skill-cat" style="--node-color:${skillCategories[skill.category]}">${skill.category}</span><h3>${skill.name}</h3><p>${skill.text}</p>`;
  panel.classList.remove("skill-panel-flash");
  void panel.offsetWidth;
  panel.classList.add("skill-panel-flash");
  document.querySelectorAll(".globe-node, .skill-index-col button").forEach(el => {
    const active = el.dataset.skill === id;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
(() => {
  const globe = document.getElementById("skill-globe");
  if (!globe) return;
  const screenEl = document.getElementById("screen-skills");
  const linesSvg = document.getElementById("globe-lines");
  const indexGrid = document.getElementById("skill-index-grid");
  const chips = [], dots = [], lines = [];
  let radius = 150, angle = 0.9, dragging = false, lastX = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spherePoint = (i, n) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = Math.PI * (3 - Math.sqrt(5)) * i;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  };
  skillData.forEach((skill, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "globe-node";
    btn.dataset.skill = skill.id;
    btn.setAttribute("data-testid", `skill-node-${skill.id}`);
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = skill.name;
    btn.style.setProperty("--node-color", skillCategories[skill.category]);
    btn.addEventListener("click", () => selectSkill(skill.id));
    globe.appendChild(btn);
    chips.push({ el: btn, ...spherePoint(i, skillData.length), chip: true });
  });
  for (let i = 0; i < 56; i++) {
    const dot = document.createElement("span");
    dot.className = "globe-dot";
    dot.setAttribute("aria-hidden", "true");
    globe.appendChild(dot);
    dots.push({ el: dot, ...spherePoint(i + 3.7, 61) });
  }
  skillData.forEach(skill => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("globe-line");
    line.style.stroke = skillCategories[skill.category];
    linesSvg.appendChild(line);
    lines.push(line);
  });
  Object.keys(skillCategories).forEach(category => {
    const col = document.createElement("div");
    col.className = "skill-index-col";
    col.style.setProperty("--node-color", skillCategories[category]);
    col.innerHTML = `<h3>${category}</h3>`;
    skillData.filter(item => item.category === category).forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.name;
      btn.dataset.skill = item.id;
      btn.setAttribute("data-testid", `skill-chip-${item.id}`);
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => selectSkill(item.id));
      col.appendChild(btn);
    });
    indexGrid.appendChild(col);
  });
  function project() {
    const w = globe.clientWidth, h = globe.clientHeight, cx = w / 2, cy = h / 2;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    for (const item of [...chips, ...dots]) {
      const x = item.x * cos + item.z * sin;
      const z = -item.x * sin + item.z * cos;
      const depth = (z + 1) / 2;
      if (item.chip) {
        item.el.style.transform = `translate(-50%,-50%) translate3d(${(x * radius).toFixed(1)}px,${(item.y * radius).toFixed(1)}px,0) scale(${(0.82 + depth * 0.26).toFixed(3)})`;
        item.el.style.opacity = (0.3 + depth * 0.7).toFixed(2);
        item.el.style.zIndex = Math.round(depth * 30);
      } else {
        item.el.style.transform = `translate(-50%,-50%) translate3d(${(x * radius).toFixed(1)}px,${(item.y * radius).toFixed(1)}px,0)`;
        item.el.style.opacity = (0.12 + depth * 0.55).toFixed(2);
      }
    }
    chips.forEach((item, i) => {
      const x = item.x * cos + item.z * sin;
      const z = -item.x * sin + item.z * cos;
      const depth = (z + 1) / 2;
      const line = lines[i];
      line.setAttribute("x1", cx.toFixed(1));
      line.setAttribute("y1", cy.toFixed(1));
      line.setAttribute("x2", (cx + x * radius).toFixed(1));
      line.setAttribute("y2", (cy + item.y * radius).toFixed(1));
      line.style.opacity = (0.1 + depth * 0.45).toFixed(2);
    });
  }
  function resize() {
    radius = Math.max(110, Math.min(globe.clientWidth, globe.clientHeight) / 2 - 76);
    linesSvg.setAttribute("viewBox", `0 0 ${globe.clientWidth} ${globe.clientHeight}`);
    project();
  }
  function loop() {
    if (!screenEl.hidden && !document.hidden && !dragging && !reduced) {
      angle += 0.0022;
      project();
    }
    requestAnimationFrame(loop);
  }
  globe.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    globe.classList.add("is-dragging");
    globe.setPointerCapture(event.pointerId);
  });
  globe.addEventListener("pointermove", event => {
    if (!dragging) return;
    angle += (event.clientX - lastX) * 0.006;
    lastX = event.clientX;
    project();
  });
  const stopDrag = () => { dragging = false; globe.classList.remove("is-dragging"); };
  globe.addEventListener("pointerup", stopDrag);
  globe.addEventListener("pointercancel", stopDrag);
  window.addEventListener("resize", resize);
  resize();
  loop();
})();

/* ---------- Page 06 — My thinking ---------- */
const thinkingStages = {
  observe: { num: "01", title: "Observe", text: "Everything starts with attention. I notice how things work, where they break, and what people around me struggle with. Curiosity comes first — solutions come later.", chips: ["Noticing friction", "Asking questions", "Collecting sparks"] },
  imagine: { num: "02", title: "Imagine", text: "Observations turn into questions: what if this worked differently? I sketch possibilities freely at this stage — judging them comes after I can actually see them.", chips: ["What-if thinking", "Sketching ideas", "Connecting dots"] },
  build: { num: "03", title: "Build", text: "Projects are my classroom. I learn by making real things — an app, a dashboard, a device — and letting the build itself teach me what theory alone can’t.", chips: ["Learning by making", "Testing in the real world", "Shipping early"] },
  improve: { num: "04", title: "Improve", text: "Shipped is just the first draft. I revisit, refine and re-test, so every iteration teaches something the original idea never could.", chips: ["Iterating", "Refining details", "Continuous learning"] },
};
(() => {
  const detail = document.querySelector(".thinking-detail");
  if (!detail) return;
  const order = ["observe", "imagine", "build", "improve"];
  const nodes = document.querySelectorAll(".net-node");
  const setStage = key => {
    const stage = thinkingStages[key];
    if (!stage) return;
    document.getElementById("thinking-stage-num").textContent = stage.num;
    document.getElementById("thinking-stage-title").textContent = stage.title;
    document.getElementById("thinking-stage-text").textContent = stage.text;
    document.getElementById("thinking-stage-chips").innerHTML = stage.chips.map(chip => `<span>${chip}</span>`).join("");
    detail.classList.add("is-open");
    nodes.forEach(node => node.classList.toggle("is-active", node.dataset.stage === key));
  };
  nodes.forEach(node => {
    node.addEventListener("click", () => setStage(node.dataset.stage));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setStage(node.dataset.stage);
      }
    });
  });
  document.getElementById("thinking-next").addEventListener("click", () => {
    const current = document.querySelector(".net-node.is-active")?.dataset.stage || "observe";
    setStage(order[(order.indexOf(current) + 1) % order.length]);
  });
  setStage("observe");
})();

/* ---------- Page 07 — Voice waveforms ---------- */
document.querySelectorAll(".waveform").forEach(wave => {
  const count = Number(wave.dataset.bars || 24);
  for (let i = 0; i < count; i++) {
    const bar = document.createElement("span");
    const height = 30 + Math.round(Math.abs(Math.sin(i * 0.9)) * 58 + Math.abs(Math.cos(i * 0.37)) * 12);
    bar.style.setProperty("--h", Math.min(100, height));
    bar.style.setProperty("--i", i);
    wave.appendChild(bar);
  }
});

/* ---------- Page 08 — Contact ---------- */
document.querySelector("[data-back-to-top]")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
