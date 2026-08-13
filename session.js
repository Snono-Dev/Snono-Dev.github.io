const sessionLanguage = localStorage.getItem("portfolio-language") || "ar";
const sessionText = {
  ar: { back:"العودة إلى الموقع",title:"تواصل معي مباشرةً",intro:"امسح رمز QR بتطبيق Session لبدء محادثة خاصة ومشفّرة.",open:"فتح Session ↗",empty:"أضف session_id إلى ملف about.ar.md لتفعيل التواصل عبر Session." },
  en: { back:"Back to portfolio",title:"Chat with me directly",intro:"Scan the QR code with Session to start a private, encrypted conversation.",open:"Open Session ↗",empty:"Add session_id to about.md to enable Session contact." }
};
const st = sessionText[sessionLanguage];
document.documentElement.lang = sessionLanguage;
document.documentElement.dir = sessionLanguage === "ar" ? "rtl" : "ltr";
document.querySelectorAll("[data-i18n]").forEach(element => element.textContent = st[element.dataset.i18n]);

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  const fields = {};
  if (match) match[1].split("\n").forEach(line => { const index = line.indexOf(":"); if (index > -1) fields[line.slice(0,index).trim()] = line.slice(index+1).trim().replace(/^['"]|['"]$/g, ""); });
  return fields;
}

async function loadSession() {
  try {
    let response = await fetch(sessionLanguage === "ar" ? "about.ar.md" : "about.md");
    if (!response.ok && sessionLanguage === "ar") response = await fetch("about.md");
    const fields = parseFrontmatter(await response.text());
    const sessionId = fields.session_id;
    if (!sessionId) throw new Error();
    const link = `https://session.id/#${encodeURIComponent(sessionId)}`;
    document.querySelector("#session-id").textContent = sessionId;
    document.querySelector("#session-qr").innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(link)}" alt="Session QR code" width="280" height="280">`;
    const sessionLink = document.querySelector("#session-link");
    sessionLink.href = link;
    sessionLink.hidden = false;
  } catch {
    document.querySelector("#session-empty").textContent = st.empty;
    document.querySelector("#session-empty").hidden = false;
  }
}
loadSession();
