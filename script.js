const config = window.PORTFOLIO_CONFIG || {};
const userFromDomain = location.hostname.endsWith(".github.io") ? location.hostname.split(".")[0] : "";
let username = config.username || userFromDomain;
const grid = document.querySelector("#projects-container") || document.querySelector("#projects-grid");
const error = document.querySelector("#projects-error");
let language = localStorage.getItem("portfolio-language") || "ar";
let profileRequest = 0;

const copy = {
  ar: { navAbout:"عني",navProjects:"المشاريع",navContact:"تواصل",eyebrow:"مطور / صانع تجارب رقمية",availableStatus:"متاح للعمل والمشاريع",heroTitle:"أحوّل الأفكار إلى<br><em>واجهات لها أثر.</em>",heroCopy:"أصمّم وأبني تجارب ويب سريعة وواضحة، مع اهتمام بالتفاصيل التي تجعل المنتج سهل الاستخدام ولا يُنسى.",explore:"استكشف المشاريع <span>↙</span>",quickChat:"محادثة سريعة ↗",aboutLabel:"01 / عني",projectsLabel:"02 / أعمال مختارة",projectsTitle:"مشاريع من GitHub",projectsNote:"يتم عرض أشهر 3 مشاريع وتصفح باقي الأعمال أفقياً.",loading:"جارِ تحميل المشاريع",latest:"الأحدث",popular:"أشهر 3 مشاريع",moreProjects:"باقي المشاريع",contactLabel:"03 / لنبدأ",contactTitle:"هل لديك فكرة<br>تستحق أن تُبنى؟",rights:"جميع الحقوق محفوظة",updated:"آخر تحديث",setup:"أضف github_username في about.md ليتم عرض مشاريعك هنا.",fail:"تعذر تحميل المشاريع. حاول لاحقاً.",visit:"زيارة الخدمة",source:"المستودع",defaultDescription:"مشروع مفتوح المصدر — اطلع على الكود من GitHub." },
  en: { navAbout:"About",navProjects:"Projects",navContact:"Contact",eyebrow:"DEVELOPER / DIGITAL MAKER",availableStatus:"Available for work & projects",heroTitle:"I turn ideas into<br><em>interfaces that matter.</em>",heroCopy:"I design and build fast, clear web experiences with attention to the details that make a product useful and memorable.",explore:"Explore projects <span>↙</span>",quickChat:"Quick chat ↗",aboutLabel:"01 / ABOUT",projectsLabel:"02 / SELECTED WORK",projectsTitle:"Projects from GitHub",projectsNote:"Top 3 most popular projects featured, with horizontal navigation for all works.",loading:"Loading projects",latest:"Latest",popular:"Top 3 Projects",moreProjects:"More Projects",contactLabel:"03 / LET'S START",contactTitle:"Have an idea<br>worth building?",rights:"All rights reserved",updated:"Updated",setup:"Add github_username to about.md to show your projects here.",fail:"Unable to load projects. Please try again later.",visit:"Visit service",source:"Repository",defaultDescription:"An open-source project. Explore the code on GitHub." }
};
const t = key => copy[language][key];
const escapeHtml = value => { const node = document.createElement("div"); node.textContent = value || ""; return node.innerHTML; };
const validUrl = value => { try { const url = new URL(value); return ["https:","http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } };
function decodeBase64(value) { const bytes = Uint8Array.from(atob(value.replace(/\n/g,"")), char => char.charCodeAt(0)); return new TextDecoder().decode(bytes); }
function parseDocument(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const fields = {};
  if (match) match[1].split("\n").forEach(line => { const separator=line.indexOf(":"); if(separator > -1) fields[line.slice(0,separator).trim()]=line.slice(separator+1).trim().replace(/^['"]|['"]$/g,""); });
  return { fields, content: match ? match[2] : markdown };
}
function renderMarkdown(source) { const safe=source.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); return safe.split(/\n\n+/).map(block=>{ if(/^# /.test(block)) return `<h2>${block.slice(2)}</h2>`; if(/^## /.test(block)) return `<h3>${block.slice(3)}</h3>`; if(/^[-*] /m.test(block)) return `<ul>${block.split("\n").filter(x=>/^[-*] /.test(x)).map(x=>`<li>${x.slice(2)}</li>`).join("")}</ul>`; return `<p>${block.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>")}</p>`; }).join(""); }
function parseProjectAbout(markdown) {
  const { fields, content } = parseDocument(markdown);
  let isVisible = true;
  if (fields.visible !== undefined) {
    isVisible = !["false", "no", "0", "off", "hidden", "draft", "disabled"].includes(String(fields.visible).toLowerCase().trim());
  } else if (fields.show !== undefined) {
    isVisible = !["false", "no", "0", "off"].includes(String(fields.show).toLowerCase().trim());
  } else if (fields.hidden !== undefined) {
    isVisible = ["false", "no", "0", "off"].includes(String(fields.hidden).toLowerCase().trim());
  } else if (fields.status !== undefined) {
    isVisible = !["draft", "hidden", "private", "disabled", "archived"].includes(String(fields.status).toLowerCase().trim());
  }
  return {
    serviceUrl: validUrl(fields.service_url),
    repositoryUrl: validUrl(fields.repository_url),
    visible: isVisible,
    description: content.replace(/^#+\s.*$/gm, "").replace(/[*_`>#]/g, "").replace(/\n+/g, " ").trim()
  };
}
const defaultProjects = [
  {
    id: 991,
    name: "wallet-address-exporter",
    language: "JavaScript",
    stargazers_count: 1,
    description: "أداة لتصدير واستخراج عناوين المحافظ الرقمية وإدارتها بسهولة وبشكل آمن وموثوق.",
    html_url: "https://github.com/Snono-Dev/wallet-address-exporter",
    updated_at: new Date().toISOString(),
    owner: { login: "Snono-Dev" }
  }
];

async function getProjectAbout(repo) {
  const path = language === "ar" ? "about.md" : "about.en.md", alt = language === "ar" ? "about.en.md" : "about.md";
  try {
    let response = await fetch(`https://api.github.com/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/contents/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok && alt !== path) response = await fetch(`https://api.github.com/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/contents/${alt}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) return {};
    return parseProjectAbout(decodeBase64((await response.json()).content));
  } catch {
    return {};
  }
}

async function card(repo, index, about) {
  const description = about?.description || repo.description || t("defaultDescription"),
    date = new Intl.DateTimeFormat(language, { month: "short", year: "numeric" }).format(new Date(repo.updated_at || Date.now())),
    repositoryUrl = about?.repositoryUrl || repo.html_url || `https://github.com/${username}/${repo.name}`,
    service = about?.serviceUrl ? `<a class="project-action project-service" href="${about.serviceUrl}" target="_blank" rel="noreferrer">${t("visit")} ↗</a>` : "";
  const details = `project.html?owner=${encodeURIComponent(repo.owner?.login || username)}&repo=${encodeURIComponent(repo.name)}`;
  return `<article class="project-card"><div class="project-number">0${index + 1}</div><div class="project-main"><div class="project-top"><span class="language">${escapeHtml(repo.language || "Code")}</span></div><h3>${escapeHtml(repo.name)}</h3><p>${escapeHtml(description)}</p></div><div class="project-actions"><a class="project-action" href="${details}">${language === "ar" ? "التفاصيل ←" : "View project →"}</a>${service}<a class="project-action" href="${repositoryUrl}" target="_blank" rel="noreferrer">${t("source")} ↗</a></div><div class="project-meta"><span>★ ${repo.stargazers_count || 0}</span><span>${t("updated")} ${date}</span></div></article>`;
}

async function loadProjects() {
  const gridEl = document.querySelector("#projects-container") || document.querySelector("#projects-grid");
  if (!gridEl) return;
  if (!username) { gridEl.innerHTML = ""; error.hidden = false; error.textContent = t("setup"); return; }
  error.hidden = true;
  gridEl.innerHTML = `<div class="loader"><i></i><i></i><i></i> <span>${t("loading")}</span></div>`;

  let repos = [];
  try {
    const result = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`, { headers: { Accept: "application/vnd.github+json" } });
    if (result.ok) {
      const raw = await result.json();
      if (Array.isArray(raw) && raw.length) {
        repos = raw.filter(r => !(config.hideForks && r.fork)).filter(r => !(config.hideArchived && r.archived));
        try { localStorage.setItem("portfolio_repos_cache_" + username, JSON.stringify(repos)); } catch {}
      }
    }
  } catch {}

  if (!repos.length) {
    try {
      const cached = localStorage.getItem("portfolio_repos_cache_" + username);
      if (cached) repos = JSON.parse(cached);
    } catch {}
  }

  if (!repos.length) {
    repos = defaultProjects.map(p => ({
      ...p,
      description: language === "ar" ? p.description : "A tool to export and manage cryptocurrency wallet addresses securely and efficiently."
    }));
  }

  const aboutData = await Promise.all(repos.map(repo => getProjectAbout(repo)));
  const aboutMap = new Map();

  repos.forEach((repo, index) => {
    const about = aboutData[index] || {};
    if (about.visible === false) return;
    aboutMap.set(repo.id, {
      description: about.description || repo.description || "",
      serviceUrl: about.serviceUrl || "",
      repositoryUrl: about.repositoryUrl || repo.html_url || `https://github.com/${username}/${repo.name}`
    });
  });

  const filtered = repos.filter(repo => aboutMap.has(repo.id));
  if (!filtered.length) {
    gridEl.innerHTML = `<p class="projects-empty" style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0;">${language === "ar" ? "لا توجد مشاريع جاهزة للعرض حالياً." : "No projects configured yet."}</p>`;
    return;
  }

  const maxProjects = parseInt(config.maxProjects, 10) || 3;
  const popular = [...filtered].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.updated_at) - new Date(a.updated_at));
  const top3 = popular.slice(0, maxProjects);
  const top3Ids = new Set(top3.map(r => r.id));
  const remaining = filtered.filter(r => !top3Ids.has(r.id));
  const allCards = new Map(await Promise.all([...top3, ...remaining].map(async (repo, index) => [repo.id, await card(repo, index, aboutMap.get(repo.id))])));

  let html = `<div class="projects-featured-group"><h3 class="repo-group-title">${t("popular")}</h3><div class="projects-grid">${top3.map(repo => allCards.get(repo.id)).join("")}</div></div>`;

  if (remaining.length) {
    html += `<div class="projects-carousel-group"><div class="carousel-header"><h3 class="repo-group-title">${t("moreProjects")} (${remaining.length})</h3><div class="carousel-nav"><button id="carousel-prev" class="carousel-arrow" type="button" aria-label="السابق">←</button><button id="carousel-next" class="carousel-arrow" type="button" aria-label="التالي">→</button></div></div><div id="projects-horizontal-track" class="projects-horizontal-track">${remaining.map(repo => allCards.get(repo.id)).join("")}</div></div>`;
  }

  gridEl.innerHTML = html;

  if (remaining.length) {
    const track = document.querySelector("#projects-horizontal-track");
    const prev = document.querySelector("#carousel-prev");
    const next = document.querySelector("#carousel-next");
    if (track && prev && next) {
      const isRtl = document.documentElement.dir === "rtl";
      prev.addEventListener("click", () => track.scrollBy({ left: isRtl ? 350 : -350, behavior: "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: isRtl ? -350 : 350, behavior: "smooth" }));
    }
  }
}
function applyProfile(fields) {
  const value=(key,fallback="")=>fields[key] || fallback;
  username=value("github_username",config.username || userFromDomain); const name=value("name","Snono-Dev"),email=value("email",config.email),sessionId=value("session_id",config.sessionId || config.session_id || "");
  document.title=`${name} | ${value("role",config.role || "Web Developer")}`; document.querySelector("#brand-name").textContent=name;
  const avatarUrl=username ? `https://github.com/${username}.png` : "https://github.com/Snono-Dev.png";
  document.querySelectorAll("#brand-avatar").forEach(img => { img.src = avatarUrl; img.alt = name; });
  document.querySelector("#hero-eyebrow").textContent=value("eyebrow",t("eyebrow")); document.querySelector("#hero-title").innerHTML=`${escapeHtml(value("hero_title","")).replace(/\n/g,"<br>")}<br><em>${escapeHtml(value("hero_emphasis","")).replace(/\n/g,"<br>")}</em>`;
  if(!fields.hero_title && !fields.hero_emphasis) document.querySelector("#hero-title").innerHTML=t("heroTitle"); document.querySelector("#hero-copy").textContent=value("hero_copy",t("heroCopy"));
  const emailEl=document.querySelector(".email-link"); if(emailEl){ emailEl.href=`mailto:${email}`; emailEl.innerHTML=`${escapeHtml(email)} <span>↖</span>`; } document.querySelectorAll(".github-profile").forEach(link=>link.href=username ? `https://github.com/${username}` : "https://github.com");
  const chat=document.querySelector("#quick-chat"); chat.hidden=!sessionId; if(sessionId) chat.href="session.html";
  const skills=value("skills","").split(",").map(s=>s.trim()).filter(Boolean); document.querySelector("#skills").innerHTML=skills.map(skill=>`<span>${escapeHtml(skill)}</span>`).join("");
  updateSeoMeta(fields);
}
function setMetaTag(name, content, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function updateSeoMeta(fields) {
  const name = fields.name || config.name || "Snono-Dev";
  const role = fields.role || config.role || "Web Developer";
  const desc = fields.hero_copy || (language === "ar" ? "بورتوفوليو شخصي — أصمم وأبني تجارب ويب سريعة وواضحة. مشاريع مفتوحة المصدر على GitHub." : "Personal portfolio — I design and build fast, clear web experiences. Open-source projects on GitHub.");
  const pageTitle = language === "ar" ? `${name} | ${role}` : `${name} | ${role}`;
  document.title = pageTitle;
  setMetaTag("description", desc);
  setMetaTag("og:title", pageTitle, "property");
  setMetaTag("og:description", desc, "property");
  setMetaTag("og:locale", language === "ar" ? "ar_AR" : "en_US", "property");
  setMetaTag("twitter:title", pageTitle);
  setMetaTag("twitter:description", desc);
}
const defaultAbout = {
  ar: `---\nname: Snono-Dev\nrole: مبرمج ومطور مستقل\ngithub_username: Snono-Dev\nemail: snono.dev@gmail.com\nsession_id: "0531c92a56798d6a33598460ad057fd9ead76482e6bc69be946cad6c733ea7f06c"\neyebrow: مبرمج مستقل / مطور ويب\nhero_title: أحوّل الأفكار إلى\nhero_emphasis: واجهات لها أثر.\nhero_copy: أصمّم وأبني تجارب ويب سريعة وواضحة، مع اهتمام بالتفاصيل التي تجعل المنتج سهل الاستخدام ولا يُنسى.\nskills: JavaScript, React, HTML / CSS, UI Design, Node.js\n---\n\n# عني\n\nأنا **Snono-Dev**، مبرمج ومطور مستقل. أبني منتجات رقمية تجمع بين **التصميم الواضح** والكود السريع والموثوق.\n\n## كيف أعمل\n\n- أبدأ بفهم المشكلة واحتياجات المستخدمين.\n- أبني واجهات متجاوبة وسهلة الوصول.\n- أحرص على كود منظم وسهل التطوير.`,
  en: `---\nname: Snono-Dev\nrole: Independent Programmer & Developer\ngithub_username: Snono-Dev\nemail: snono.dev@gmail.com\nsession_id: "0531c92a56798d6a33598460ad057fd9ead76482e6bc69be946cad6c733ea7f06c"\neyebrow: INDEPENDENT PROGRAMMER / WEB DEVELOPER\nhero_title: I turn ideas into\nhero_emphasis: interfaces that matter.\nhero_copy: I design and build fast, clear web experiences with attention to the details that make a product useful and memorable.\nskills: JavaScript, React, HTML / CSS, UI Design, Node.js\n---\n\n# About me\n\nI'm **Snono-Dev**, an independent programmer and developer. I build digital products that combine **clear design** with reliable, fast code.\n\n## How I work\n\n- Start by understanding the problem and its users.\n- Build responsive, accessible interfaces.\n- Keep the code organised and easy to evolve.`
};
async function loadAbout() {
  const request = ++profileRequest;
  let text = "";
  try {
    let response = await fetch(language === "ar" ? "about.md" : "about.en.md");
    if (!response.ok) response = await fetch(language === "ar" ? "about.en.md" : "about.md");
    if (response.ok) text = await response.text();
  } catch (err) {
    // If opened via file:// or fetch blocked, fallback to defaultAbout
  }
  if (!text) text = defaultAbout[language] || defaultAbout.ar;
  if (request !== profileRequest) return;
  const documentData = parseDocument(text);
  document.querySelector("#about-content").innerHTML = renderMarkdown(documentData.content);
  applyProfile(documentData.fields);
  loadProjects();
}
function setLanguage(next) { language=next; localStorage.setItem("portfolio-language",next); document.documentElement.lang=next; document.documentElement.dir=next === "ar" ? "rtl" : "ltr"; document.querySelector("#language-toggle").textContent=next === "ar" ? "EN" : "ع"; document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n)); document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml)); loadAbout(); }
document.querySelector("#year").textContent=new Date().getFullYear(); document.querySelector("#language-toggle").addEventListener("click",()=>setLanguage(language === "ar" ? "en" : "ar")); setLanguage(language);
