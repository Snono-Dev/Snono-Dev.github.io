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
function markdownToHtml(markdown) { const safe=escapeProjectHtml(markdown); return safe.split(/\n\n+/).map(block=>{ if(/^### /.test(block)) return `<h3>${block.slice(4)}</h3>`; if(/^## /.test(block)) return `<h2>${block.slice(3)}</h2>`; if(/^# /.test(block)) return `<h1>${block.slice(2)}</h1>`; if(/^[-*] /m.test(block)) return `<ul>${block.split("\n").filter(line=>/^[-*] /.test(line)).map(line=>`<li>${line.slice(2)}</li>`).join("")}</ul>`; return `<p>${block.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`(.+?)`/g,"<code>$1</code>").replace(/\n/g,"<br>")}</p>`; }).join(""); }
function isUrl(value) { try { const url=new URL(value); return ["https:","http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } }
async function getContents(path) { const response=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/contents/${path}`,{headers:{Accept:"application/vnd.github+json"}}); if(!response.ok) return null; const file=await response.json(); const bytes=Uint8Array.from(atob(file.content.replace(/\n/g,"")),char=>char.charCodeAt(0)); return new TextDecoder().decode(bytes); }
async function loadProject() {
  if(!owner || !repoName) { document.querySelector("#readme-content").textContent=projectCopy.invalid; return; }
  document.title=`${repoName} | Project`;
  document.querySelector("#project-name").textContent=repoName;
  const sourceUrl=`https://github.com/${owner}/${repoName}`;
  const [about,readme] = await Promise.all([getContents("about.md"), getContents(projectLanguage === "ar" ? "README.ar.md" : "README.md")]);
  const aboutData=parseProjectDocument(about || "");
  const serviceUrl=isUrl(aboutData.fields.service_url);
  document.querySelector("#project-links").innerHTML=`${serviceUrl ? `<a class="button button-primary" href="${serviceUrl}" target="_blank" rel="noreferrer">${projectCopy.service}</a>` : ""}<a class="button button-outline" href="${sourceUrl}" target="_blank" rel="noreferrer">${projectCopy.source}</a>`;
  if(!readme) { document.querySelector("#readme-content").textContent=projectCopy.unavailable; return; }
  document.querySelector("#readme-content").innerHTML=markdownToHtml(readme);
}
loadProject().catch(() => { document.querySelector("#readme-content").textContent=projectCopy.unavailable; });
