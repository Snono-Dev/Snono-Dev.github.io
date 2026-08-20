# PROJECT-MAP — دليل شامل لمشروع Snono-Dev Portfolio

> دليل تفصيلي يشرح كل ملف في المشروع، كيف يعمل، وكيف يتصل بالملفات الأخرى.
> أي شخص يستطيع قراءة هذا الملف وفهم المشروع بالكامل.

---

## نظرة عامة على المشروع

هذا موقع **بورتوفوليو شخصي (Portfolio)** يعمل على **GitHub Pages** بدون أي خادم (serverless). يعرض معلومات المطور ومشاريعه الم.Fetch من GitHub API تلقائياً. يدعم **العربية والإنجليزية** بضغطة زر.

### المميزات الرئيسية

- صفحات ثابتة (Static) — لا تحتاج Node.js أو أي أدوات بناء
- سحب المشاريع تلقائياً من GitHub API
- ترجمة ثنائية اللغة (AR/EN) بضغطة زر واحدة
- اتصال آمن عبر Session (تطبيق مراسلة مشفّر)
- تصميم متجاوب يعمل على جميع الشاشات
- تحديث تلقائي للمشاريع عند تغييرها على GitHub

---

## خريطة الملفات

```
Snono-Dev/
├── index.html          → الصفحة الرئيسية (الرئيسية)
├── project.html        → صفحة تفاصيل مشروع محدد
├── session.html        → صفحة التواصل عبر Session
├── styles.css          → جميع الأنماط (CSS) للموقع
├── config.js           → إعدادات التخصيص الأساسية
├── script.js           → محرك الصفحة الرئيسية (الأكبر والأهم)
├── project.js          → منطق صفحة تفاصيل المشروع
├── session.js          → منطق صفحة Session للتواصل
├── about.md            → ملف البيانات بالعربية (frontmatter + محتوى)
├── about.en.md         → ملف البيانات بالإنجليزية
└── README.md           → توثيق المشروع على GitHub
```

---

## شرح تفصيلي لكل ملف

---

### 1. `config.js` — ملف الإعدادات

```js
window.PORTFOLIO_CONFIG = {
  username: "Snono-Dev",        // اسم المستخدم على GitHub
  name: "Snono-Dev",           // الاسم المعروض
  role: "Independent Programmer & Developer",
  email: "snono.dev@gmail.com",
  sessionId: "0531c92a...",     // معرّف Session للتواصل
  quickChatUrl: "",              // رابط بديل (Calendly, WhatsApp...) — غير مستخدم حالياً
  maxProjects: 3,                // عدد المشاريع المعروضة في أعلى الصفحة (Top N)
  hideForks: true,               // إخفاء المشاريع المُستنسخة (Forks)
  hideArchived: true             // إخفاء المشاريع المؤرشفة
};
```

> **ملاحظة:** `quickChatUrl` معرّف لكن غير مستخدم في الكود الحالي — زر "محادثة سريعة" يفتح `session.html` دائماً.

**كيف يعمل:** يُحمَّل أولاً في `index.html` و`session.html` قبل كل شيفرة أخرى. يضع البيانات في `window.PORTFOLIO_CONFIG` لتكون متاحة للملفات الأخرى. هذا الملف هو نقطة الدخول للخصائص.

**الميزة:** مركز التحكم الوحيد — تغيير اسم أو بريد أو معرّف ينعكس على كل الموقع فوراً.

---

### 2. `index.html` — الصفحة الرئيسية

**البنية:** صفحة HTML عربية (dir="rtl") تحتوي 4 أقسام رئيسية:

| القسم | المعرّف | المحتوى |
|---|---|---|
| **Hero** (البطل) | `#home` | العنوان الرئيسي + أزرار الاستكشاف + رابط GitHub + زر Session |
| **عني** (About) | `#about` | نبذة شخصية + مهارات (Skills) |
| **المشاريع** (Projects) | `#projects` | بطاقات المشاريع المجلبة من GitHub |
| **تواصل** (Contact) | `#contact` | البريد الإلكتروني + دعوة للتواصل |

**الميزة:** تستخدم نظام `data-i18n` و`data-i18n-html` للترجمة — أي عنصر يحمل `data-i18n="navAbout"` سي自動 ترجمته `script.js` حسب اللغة المحددة.

**التحميل:** يستدعي `config.js` أولاً ثم `script.js`. لا يستدعي `project.js` أو `session.js`.

---

### 3. `script.js` — محرك الصفحة الرئيسية (الملف الأكبر — 188 سطر)

هذا **قلب المشروع**. يحتوي على كل المنطق الأساسي. إليك أقسامه:

#### أ. نظام الترجمة (i18n)

```
copy.ar = { navAbout: "عني", heroTitle: "أحوّل الأفكار إلى...", ... }
copy.en = { navAbout: "About", heroTitle: "I turn ideas into...", ... }
```

- يخزّن اللغة في `localStorage` باسم `portfolio-language`
- دالة `setLanguage(next)` تُبدّل كل النصوص في الصفحة فوراً
- زر `#language-toggle` ي altern بين AR و EN
- يُحدّث `lang` و`dir` في `<html>` للاعتماد على RTL/LTR

#### ب. تحليل ملفات Markdown (Frontmatter Parsing)

دالة `parseDocument(markdown)`:

```md
---
name: Snono-Dev
role: مبرمج
---
هذا محتوى about.md
```

- تفصل الـ **Frontmatter** (البيانات بين `---`) عن **المحتوى**
- تُحوّل الحقول إلى خريطة `fields`
- تُستخدم في `loadAbout()` لقراءة `about.md`

#### ج. جلب المشاريع من GitHub API

```
loadProjects():
  1. يجلب المستودعات: GET /users/{username}/repos?sort=updated&per_page=100
  2. يُصفّي: يزيل Forks و Archived حسب config
  3. يخزّن النتيجة في localStorage كـ cache
  4. إذا فشل الجلب → يستخدم cache → إذا لم يوجد cache → يستخدم defaultProjects
  5. لكل مشروع: يجلب about.md الخاص به via getProjectAbout()
  6. يُرتب المشاريع: Top N حسب config.maxProjects (الأشهر بالنجوم) + الباقي في كاروسيل أفقي
```

**الميزة:** نظام Cache ثلاثي الطبقات:
1. GitHub API (الأحدث)
2. `localStorage` (إذا فشل الاتصال)
3. `defaultProjects` (بيانات افتراضية مضمّنة)

#### د. إنشاء بطاقات المشاريع

دالة `card(repo, index, about)` تُنشئ HTML لكل بطاقة مشروع:

```html
<article class="project-card">
  <div class="project-number">01</div>
  <h3>repository-name</h3>
  <p>وصف المشروع</p>
  <div class="project-actions">
    <a>التفاصيل ←</a>       → project.html?owner=X&repo=Y
    <a>زيارة الخدمة ↗</a>   → service_url من about.md
    <a>المستودع ↗</a>        → رابط GitHub
  </div>
  <div class="project-meta">
    <span>★ 5</span>
    <span>آخر تحديث Aug 2026</span>
  </div>
</article>
```

#### هـ. تحليل about.md الخاص بالمشاريع

دالة `parseProjectAbout(markdown)` تقرأ:

```md
---
visible: true
service_url: https://my-app.pages.dev
repository_url: https://github.com/user/repo
---
وصف قصير للمشروع
```

- تدعم حقول: `visible`, `show`, `hidden`, `status` للتحكم بالظهور
- تدعم قيم إخفاء: `false`, `no`, `0`, `off`, `hidden`, `draft`, `disabled`
- تستخرج `service_url` و`repository_url`
- تستخرج الوصف من المحتوى بعد تنظيفه

#### و. تحميل ملف "عني" (about)

```
loadAbout():
  1. يجلب about.md (عربي) أو about.en.md (إنجليزي)
  2. إذا فشل → يحاول الملف الآخر
  3. إذا فشل كلاهما → يستخدم defaultAbout المضمّن
  4. يحلل الملف ويُطبّق البيانات على الصفحة
```

دالة `applyProfile(fields)` تُحدّث:
- عنوان الصفحة (`<title>`)
- اسم البراند في الهيدر
- صورة الأفاتار من GitHub
- العنوان الرئيسي والنص الترويجي
- البريد الإلكتروني
- المهارات (Skills)
- زر Session (يظهر/يختفي حسب وجود `session_id`)

---

### 4. `project.html` — صفحة تفاصيل المشروع

صفحة بسيطة تحتوي حاوية فارغة:

```html
<h1 id="project-name">Loading…</h1>
<div id="project-links"></div>
<article id="readme-content">جارِ تحميل...</article>
```

تستدعي `project.js` فقط (لا `config.js` أو `script.js`).

**الميزة:** تتلقى البيانات عبر URL Parameters: `project.html?owner=Snono-Dev&repo=repo-name`

---

### 5. `project.js` — منطق صفحة تفاصيل المشروع (90 سطر)

####كيف يعمل:

```
loadProject():
  1. يقرأ owner و repo من URL (?owner=X&repo=Y)
  2. يجلب about.md + README.md من GitHub API بشكل متوازي (Promise.all)
  3. يحاول اللغة المطلوبة أولاً ثم البديلة (fallback)
  4. يعرض: أزرار (زيارة الخدمة + المستودع) + محتوى README
```

#### محلل Markdown مخصص

دالة `markdownToHtml(markdown)` — مُحلل بسيط وفعّال:

- يدعم: `#`, `##`, `###` → `<h1>`, `<h2>`, `<h3>`
- يدعم: `- item` → `<ul><li>item</li></ul>`
- يدعم: `**نص**` → `<strong>نص</strong>`
- يدعم: `` `كود` `` → `<code>كود</code>`
- يدعم: `[نص](رابط)` → `<a href="رابط">نص</a>`
- يدعم: ``` ```blok kod``` ``` → `<pre><code>blok kod</code></pre>`
- يحمي من XSS عبر `escapeProjectHtml()`

**الميزة:** لا يحتاج مكتبة خارجية — محلل Markdown خفيف ومخصص بالكامل.

---

### 6. `session.html` — صفحة التواصل عبر Session

صفحة بسيطة تعرض:
- رمز QR للمعرّف
- المعرّف النصي مع زر نسخ
- رابط تحميل تطبيق Session

تستدعي `config.js` ثم `session.js`.

---

### 7. `session.js` — منطق صفحة Session (88 سطر)

####كيف يعمل:

```
loadSession():
  1. يقرأ session_id من config.js (كخيار افتراضي)
  2. يحاول قراءة session_id من about.md (أولوية أعلى)
  3. إذا لم يوجد → يعرض رسالة "أضف session_id"
  4. إذا وجد → يعرض:
     - رمز QR (من api.qrserver.com)
     - المعرّف النصي
     - زر نسخ للمعرّف (Clipboard API)
```

**الميزة:** رمز QR يُولّد تلقائياً من خدمة خارجية — لا يحتاج مكتبة QR محلية.

---

### 8. `about.md` — ملف البيانات العربي

هذا الملف يخدم **هدفين**:

**أولاً: كملف frontmatter للبيانات:**
```yaml
---
name: Snono-Dev
role: مبرمج ومطور مستقل
github_username: Snono-Dev
email: snono.dev@gmail.com
session_id: "0531c92a..."
eyebrow: مبرمج مستقل / مطور ويب
hero_title: أحوّل الأفكار إلى
hero_emphasis: واجهات لها أثر.
hero_copy: أصمّم وأبني...
skills: JavaScript, React, HTML / CSS, UI Design, Node.js
---
```

**ثانياً: كمحتوى صفحة "عني":**
```markdown
# عني
أنا **Snono-Dev**، مبرمج ومطور مستقل...
## كيف أعمل
- أبدأ بفهم المشكلة...
```

**الميزة:** ملف واحد يتحكم بكل شيء — البيانات والمحتوى معاً. لا حاجة لتعديل JSON أو قواعد بيانات.

---

### 9. `about.en.md` — ملف البيانات الإنجليزية

نسخة إنجليزية من `about.md` بنفس البنية بالضبط. يستخدم当他 المستخدم يضغط زر "EN".

**الميزة:** نظام fallback — إذا لم يوجد `about.en.md` يحاول `about.md` والعكس.

---

### 10. `styles.css` — ملف الأنماط (105 سطر مضغوط)

#### النظام اللوني:

```css
--ink: #080808       /* الخلفية السوداء */
--orange: #ff6b00    /* اللون البرتقالي الرئيسي */
--paper: #f5f1ea     /* لون النصوص */
--muted: #a4a09a     /* النصوص الثانوية */
--line: #333333      /* الحدود */
```

#### الخطوط:

- **IBM Plex Sans Arabic** — الخط الرئيسي (عربي + إنجليزي)
- **DM Mono** — الخطوط التقنية (أرقام المشاريع، التسميات، الأكواد)

#### المكونات الرئيسية:

| المكون | الوصف |
|---|---|
| `.noise` | طبقة ضوضاء SVG ثابتة على الصفحة (تأثير بصري خفيف) |
| `.button-primary` | زر برتقالي مع ظلال وتأثيرات hover |
| `.button-outline` | زر شفاف مع حدود بيضاء |
| `.button-chat` | زر أخضر مع نقطة متوهجة (للـ Session) |
| `.project-card` | بطاقة مشروع مع تأثير hover برتقالي |
| `.projects-horizontal-track` | كاروسيل أفقي للمشاريع الإضافية |
| `.session-card` | بطاقة Session مع خلفية radial gradient |
| `.contact` | قسم التواصل بخلفية برتقالية كاملة |

#### التصميم المتجاوب:

@media (max-width: 700px):
- التخطيط يتحول من grid إلى عمود واحد
- الحجم يتناسب مع الشاشة عبر `clamp()`
- التباعد يتقلص

**الميزة:** ملف CSS واحد فقط — لا برcompiled CSS أو PostCSS. جميع التأثيرات CSS خالصة.

---

## كيف تتصل الملفات ببعضها (Diagram)

```
┌──────────────────────────────────────────────────────────┐
│                    index.html                            │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐   │
│  │about.md  │→ │ script.js │→ │   GitHub API        │   │
│  │(ar data) │  │           │  │  /users/X/repos     │   │
│  └──────────┘  │ • ترجمة   │  │  /repos/X/Y/contents│   │
│  ┌──────────┐  │ • جلب     │  └─────────────────────┘   │
│  │about.en  │→ │ • عرض     │                             │
│  │(en data) │  │ • تحليل   │  ┌─────────────────────┐   │
│  └──────────┘  │           │→ │   localStorage      │   │
│                └───────────┘  │  (cache fallback)   │   │
│  ┌──────────┐                 └─────────────────────┘   │
│  │config.js │─────────────────────↑                     │
│  └──────────┘                                            │
└──────────────────────────────────────────────────────────┘
           │
           │ (البطاقة تفتح رابط)
           ▼
┌──────────────────────────────────────────────────────────┐
│                  project.html                            │
│                                                          │
│  ┌────────────┐  ┌──────────────┐                       │
│  │ project.js │→ │ GitHub API   │                       │
│  │            │  │ /repos/X/Y/  │                       │
│  │ • about.md │  │  contents/   │                       │
│  │ • README   │  └──────────────┘                       │
│  │ • markdown │                                         │
│  └────────────┘                                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 session.html                             │
│                                                          │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │config.js │→ │ session.js │→ │ qrserver.com (QR)  │   │
│  └──────────┘  │            │  └────────────────────┘   │
│  ┌──────────┐  │ • about.md │                           │
│  │about.md  │→ │ • clipboard│                           │
│  └──────────┘  └────────────┘                           │
└──────────────────────────────────────────────────────────┘
```

---

## دورة حياة الصفحة الرئيسية (Flow)

```
1. المتصفح يفتح index.html
        ↓
2. يُحمَّل config.js → يضع PORTFOLIO_CONFIG في window
        ↓
3. يُحمَّل script.js
        ↓
4. setLanguage() → يقرأ اللغة من localStorage
        ↓
5. loadAbout() → يجلب about.md أو about.en.md
        ↓
6. parseDocument() → يفصل frontmatter عن المحتوى
        ↓
7. applyProfile() → يُحدّث كل عناصر الصفحة بالبيانات
        ↓
8. renderMarkdown() → يُحوّل المحتوى إلى HTML ويعرضه في #about-content
        ↓
9. loadProjects() → يجلب المشاريع من GitHub API
        ↓
10. getProjectAbout() → لكل مشروع: يجلب about.md الخاص به
        ↓
11. card() → يُنشئ بطاقات HTML للمشاريع
        ↓
  12. يعرض: Top N (شبكة) — حسب config.maxProjects — + باقي المشاريع (كاروسيل أفقي)
```

---

## نظام الترجمة (i18n) — كيف يعمل بالتفصيل

### في HTML:

```html
<!-- للنص العادي -->
<span data-i18n="navAbout">عني</span>

<!-- للنص الذي يحتوي HTML -->
<h1 data-i18n-html="heroTitle">أحوّل الأفكار إلى<br><em>...</em></h1>
```

### في JavaScript:

```js
// البحث عن كل العناصر وترجمتها
document.querySelectorAll("[data-i18n]").forEach(el => {
  el.textContent = t(el.dataset.i18n);  // t() ترجع النص من copy.ar أو copy.en
});
document.querySelectorAll("[data-i18n-html]").forEach(el => {
  el.innerHTML = t(el.dataset.i18nHtml);
});
```

### الاتجاه (RTL/LTR):

```js
document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
```

**الميزة:** أي شخص يستطيع إضافة ترجمة بسهولة — فقط أضف `data-i18n="مفتاح"` في HTML والمفتاح في كائن `copy`.

---

## نظام Cache (التخزين المؤقت) — ثلاث طبقات

```
┌─────────────────────────┐
│   GitHub API (الأحدث)   │  ← الأولوية 1
└────────────┬────────────┘
             │ إذا فشل
             ▼
┌─────────────────────────┐
│  localStorage (محلي)    │  ← الأولوية 2
└────────────┬────────────┘
             │ إذا لم يوجد
             ▼
┌─────────────────────────┐
│  defaultProjects        │  ← الأولوية 3 (مضمّنة في script.js)
└─────────────────────────┘
```

**الميزة:** الموقع يعمل حتى بدون إنترنت بعد أول زيارة — جميع البيانات محفوظة محلياً.

---

## التأثيرات البصرية (Animations & Effects)

| التأثير | الموقع | الطريقة |
|---|---|---|
| **Noise overlay** | كل الصفحات | طبقة SVG ثابتة `opacity: 0.045` |
| **Card hover** | `.project-card` | تغيير لون + ارتفاع + ظلال |
| **Button hover** | كل الأزرار | `translateY(-2px)` + ظلال متوهجة |
| **Carousel scroll** | المشاريع الإضافية | `scroll-snap` + سهمون أفقية |
| **Loader** | تحميل المشاريع | 3 نقاط برتقالية متحركة (`@keyframes bounce`) |
| **Avatar pulse** | الهيدر | `transform: scale(1.08)` عند hover |
| **QR glow** | صفحة Session | ظل أبيض خلف رمز QR |

---

## ملاحظات تقنية مهمة

1. **لا ملفات مخفية:** لا `package.json`، لا `node_modules`، لا `tsconfig.json`. المشروع خالص HTML/CSS/JS.

2. **لا builds:** لا حاجة لـ `npm run build`. كل ملف يُحمّل مباشرة من المتصفح.

3. **Git tracked:** المشروع محفوظ في Git (`git init` موجود بالفعل).

4. **الأمان:**
   - XSS protection عبر `escapeHtml()` و`escapeProjectHtml()`
   - لا مفاتيح سرية (API keys) في الكود — GitHub API لا تحتاج مفتاح للمستودعات العامة
   - `rel="noreferrer"` على جميع الروابط الخارجية

5. **الحجم:** ~57 KB فقط لجميع الملفات — موقع خفيف جداً.

6. **الأخطاء:** كل `fetch()` محاط بـ `try/catch` مع fallback — الموقع لا يتعطل أبداً.

7. **التوافق:** يعمل على جميع المتصفحات الحديثة + الموبايل.

---

## كيفية التعديل السريع

| ما تريد تعديله | الملف الذي تفتحه |
|---|---|
| الاسم أو البريد أو المهارات | `about.md` (عربي) أو `about.en.md` (إنجليزي) |
| عدد المشاريع المعروضة | `config.js` → `maxProjects` (يتحكم في أعلى N مشاريع معروضة كشبكة) |
| إخفاء مشروع معين | `about.md` الخاص بذلك المشروع: `visible: false` |
| إضافة رابط خدمة لمشروع | `about.md`: `service_url: https://...` |
| تغيير الألوان | `styles.css` → `:root` (المتغيرات) |
| إضافة لغة ثالثة | `script.js` → كائن `copy` + دالة `setLanguage()` |
| تغيير الخطوط | `styles.css` → سطر `@import` |
| إضافة قسم جديد | `index.html` + `styles.css` + `script.js` |

---

*تم إنشاء هذا الملف تلقائياً بواسطة تحليل شامل لجميع ملفات المشروع.*
