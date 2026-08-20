const sessionLanguage = localStorage.getItem("portfolio-language") || "ar";
const sessionText = {
  ar: {
    back: "العودة إلى الموقع",
    title: "تواصل معي مباشرةً",
    intro: "امسح رمز QR من تطبيق Session أو انسخ المعرّف لبدء محادثة مشفّرة.",
    copy: "نسخ المعرّف 📋",
    copied: "✓ تم نسخ المعرّف",
    download: "تحميل تطبيق Session ↗",
    empty: "أضف session_id إلى ملف about.md لتفعيل التواصل عبر Session."
  },
  en: {
    back: "Back to portfolio",
    title: "Chat with me directly",
    intro: "Scan the QR code in the Session app or copy the ID to start an encrypted conversation.",
    copy: "Copy Session ID 📋",
    copied: "✓ ID Copied",
    download: "Download Session App ↗",
    empty: "Add session_id to about.en.md to enable Session contact."
  }
};
const st = sessionText[sessionLanguage];
document.documentElement.lang = sessionLanguage;
document.documentElement.dir = sessionLanguage === "ar" ? "rtl" : "ltr";
document.querySelectorAll("[data-i18n]").forEach(element => element.textContent = st[element.dataset.i18n] || element.textContent);

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  const fields = {};
  if (match) match[1].split("\n").forEach(line => { const index = line.indexOf(":"); if (index > -1) fields[line.slice(0,index).trim()] = line.slice(index+1).trim().replace(/^['"]|['"]$/g, ""); });
  return fields;
}

async function loadSession() {
  const config = window.PORTFOLIO_CONFIG || {};
  let sessionId = config.sessionId || config.session_id || "";
  try {
    let response = await fetch(sessionLanguage === "ar" ? "about.md" : "about.en.md");
    if (!response.ok) response = await fetch(sessionLanguage === "ar" ? "about.en.md" : "about.md");
    if (response.ok) {
      const fields = parseFrontmatter(await response.text());
      if (fields.session_id) sessionId = fields.session_id;
    }
  } catch (err) {
    // If local fetch is restricted by browser (file:// protocol), uses config.sessionId
  }
  if (!sessionId) {
    const emptyEl = document.querySelector("#session-empty");
    if (emptyEl) {
      emptyEl.textContent = st.empty;
      emptyEl.hidden = false;
    }
    return;
  }

  const idEl = document.querySelector("#session_id");
  const copyBtn = document.querySelector("#copy-btn");

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      if (copyBtn) copyBtn.textContent = st.copied;
      if (idEl) idEl.textContent = st.copied;
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = st.copy;
        if (idEl) idEl.textContent = sessionId;
      }, 2000);
    } catch {}
  };

  if (idEl) {
    idEl.textContent = sessionId;
    idEl.title = sessionLanguage === "ar" ? "اضغط لنسخ المعرّف" : "Click to copy ID";
    idEl.style.cursor = "pointer";
    idEl.addEventListener("click", copyId);
  }

  if (copyBtn) {
    copyBtn.textContent = st.copy;
    copyBtn.addEventListener("click", copyId);
  }

  const qrEl = document.querySelector("#session-qr");
  if (qrEl) {
    qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sessionId)}" alt="Session QR code" width="280" height="280">`;
  }
}
loadSession();
