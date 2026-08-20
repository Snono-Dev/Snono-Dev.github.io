const params = new URLSearchParams(location.search);
const owner = params.get("owner");
const repoName = params.get("repo");
const projectLanguage = localStorage.getItem("portfolio-language") || "ar";
const projectCopy = projectLanguage === "ar"
  ? { back:"العودة للمشاريع", loading:"جارِ تحميل تفاصيل المشروع...", unavailable:"لا يوجد ملف README لهذه اللغة في هذا المستودع.", source:"المستودع ↗", service:"زيارة الخدمة ↗", invalid:"رابط المشروع غير صالح." }
  : { back:"Back to projects", loading:"Loading project details...", unavailable:"No README file is available for this language in this repository.", source:"Repository ↗", service:"Visit service ↗", invalid:"Invalid project link." };
document.documentElement.lang = projectLanguage; document.documentElement.dir = projectLanguage === "ar" ? "rtl" : "ltr";
document.querySelector("#back-label").textContent = projectCopy.back;
const escapeProjectHtml = value => { const el=document.createElement("div"); el.textContent=value || ""; return el.innerHTML; };
function parseProjectDocument(markdown) { const match=markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/); const fields={}; if(match) match[1].split("\n").forEach(line=>{const i=line.indexOf(":");if(i>-1) fields[line.slice(0,i).trim()]=line.slice(i+1).trim().replace(/^['"]|['"]$/g,"");}); return {fields,content:match?match[2]:markdown}; }
function inlineFormat(text) {
  return text
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
function markdownToHtml(markdown) {
  const safe = escapeProjectHtml(markdown);
  const blocks = [];
  const lines = safe.split("\n");
  let inCode = false, currentCode = [], currentBlock = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        currentCode.push(line);
        blocks.push({ type: "code", text: currentCode.join("\n") });
        currentCode = [];
        inCode = false;
      } else {
        if (currentBlock.length) {
          blocks.push({ type: "text", text: currentBlock.join("\n").trim() });
          currentBlock = [];
        }
        inCode = true;
        currentCode.push(line);
      }
    } else if (inCode) {
      currentCode.push(line);
    } else {
      if (line.trim() === "") {
        if (currentBlock.length) {
          blocks.push({ type: "text", text: currentBlock.join("\n").trim() });
          currentBlock = [];
        }
      } else {
        currentBlock.push(line);
      }
    }
  }
  if (currentBlock.length) blocks.push({ type: "text", text: currentBlock.join("\n").trim() });
  if (currentCode.length) blocks.push({ type: "code", text: currentCode.join("\n") });

  return blocks.filter(b => b.text).map(b => {
    if (b.type === "code") {
      const cleaned = b.text.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "");
      return `<pre><code>${cleaned}</code></pre>`;
    }
    const block = b.text;
    if (/^### /.test(block)) return `<h3>${block.slice(4)}</h3>`;
    if (/^## /.test(block)) return `<h2>${block.slice(3)}</h2>`;
    if (/^# /.test(block)) return `<h1>${block.slice(2)}</h1>`;
    if (/^[-*] /m.test(block)) {
      return `<ul>${block.split("\n").filter(l => /^[-*] /.test(l.trim())).map(l => `<li>${inlineFormat(l.trim().slice(2))}</li>`).join("")}</ul>`;
    }
    return `<p>${inlineFormat(block).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}
function isUrl(value) { try { const url=new URL(value); return ["https:","http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } }
async function getContents(path) { const response=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/contents/${path}`,{headers:{Accept:"application/vnd.github+json"}}); if(!response.ok) return null; const file=await response.json(); const bytes=Uint8Array.from(atob(file.content.replace(/\n/g,"")),char=>char.charCodeAt(0)); return new TextDecoder().decode(bytes); }
async function loadProject() {
  if(!owner || !repoName) { document.querySelector("#readme-content").textContent=projectCopy.invalid; return; }
  const projectTitle = `${repoName} | Project`;
  document.title = projectTitle;
  document.querySelector("#project-name").textContent=repoName;
  const langEl = document.querySelector("#project-language");
  if (langEl) langEl.textContent = `${owner} / ${repoName}`;
  function setProjectMeta(name, content, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  }
  setProjectMeta("description", projectLanguage === "ar" ? `تفاصيل مشروع ${repoName} — ${owner}` : `Project details: ${repoName} — ${owner}`);
  setProjectMeta("og:title", projectTitle, "property");
  setProjectMeta("og:description", projectLanguage === "ar" ? `مشروع مفتوح المصدر من ${owner}` : `Open-source project by ${owner}`, "property");
  setProjectMeta("twitter:title", projectTitle);
  setProjectMeta("twitter:description", projectLanguage === "ar" ? `مشروع مفتوح المصدر من ${owner}` : `Open-source project by ${owner}`);
  const sourceUrl=`https://github.com/${owner}/${repoName}`;
  const aboutFile=projectLanguage === "ar" ? "about.md" : "about.en.md",aboutFallback=projectLanguage === "ar" ? "about.en.md" : "about.md",readmeFile=projectLanguage === "ar" ? "README.md" : "README.en.md",readmeFallback=projectLanguage === "ar" ? "README.en.md" : "README.md";
  const [about,readme] = await Promise.all([
    getContents(aboutFile).then(result => result || getContents(aboutFallback)),
    getContents(readmeFile).then(result => result || getContents(readmeFallback))
  ]);
  const aboutData=parseProjectDocument(about || "");
  const serviceUrl=isUrl(aboutData.fields.service_url);
  document.querySelector("#project-links").innerHTML=`${serviceUrl ? `<a class="button button-primary" href="${serviceUrl}" target="_blank" rel="noreferrer">${projectCopy.service}</a>` : ""}<a class="button button-outline" href="${sourceUrl}" target="_blank" rel="noreferrer">${projectCopy.source}</a>`;
  if(!readme) { document.querySelector("#readme-content").textContent=projectCopy.unavailable; return; }
  document.querySelector("#readme-content").innerHTML=markdownToHtml(readme);
}
loadProject().catch(() => { document.querySelector("#readme-content").textContent=projectCopy.unavailable; });
