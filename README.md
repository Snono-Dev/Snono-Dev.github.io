# بورتوفوليو Snono-Dev

بورتوفوليو شخصي عربي/إنجليزي يعمل على **GitHub Pages** — صفحات ثابتة بالكامل، لا يحتاج Node.js ولا خادم ولا أدوات بناء.

يجلب المشاريع تلقائياً من **GitHub API**، يدعم الترجمة ثنائية اللغة، يتواصل عبر **Session**، ومحسّن بالكامل لمحركات البحث.

---

## المميزات

- **صفحات ثابتة** — HTML + CSS + JS فقط، لا ملفات مخفية ولا بناء
- **جلب المشاريع من GitHub** — يجلب المستودعات تلقائياً مع فلترة Forks وArchived
- **ترجمة ثنائية اللغة** — AR/EN بضغطة زر واحدة مع RTL/LTR تلقائي
- **تواصل عبر Session** — رمز QR + نسخ المعرّف + تحميل التطبيق
- **تحسين SEO كامل** — Meta tags, Open Graph, Twitter Card, JSON-LD, sitemap.xml, robots.txt
- **تصميم متجاوب** — يعمل على جميع الشاشات من الموبايل إلى الديسكتوب
- **نظام Cache ثلاثي الطبقات** — GitHub API → localStorage → بيانات افتراضية
- **حماية XSS** — جميع المدخلات محصّنة
- **بدون تبعيات** — لا مكتبات خارجية، كل شيفرة مخصصة وخفيفة (~57 KB)

---

## بنية الملفات

```
Snono-Dev/
├── index.html          الصفحة الرئيسية
├── project.html        صفحة تفاصيل مشروع
├── session.html        صفحة التواصل عبر Session
├── styles.css          جميع الأنماط
├── config.js           إعدادات التخصيص
├── script.js           محرك الصفحة الرئيسية (ترجمة + جلب + عرض)
├── project.js          منطق صفحة تفاصيل المشروع
├── session.js          منطق صفحة Session
├── about.md            بيانات الموقع بالعربية (frontmatter + محتوى)
├── about.en.md         بيانات الموقع بالإنجليزية
├── sitemap.xml         خريطة الموقع لمحركات البحث
├── robots.txt          تعليمات الزحف لمحركات البحث
├── README.md           هذا الملف (عربي)
└── README.en.md        النسخة الإنجليزية
```

---

## التخصيص

### 1. الإعدادات — `config.js`

```js
window.PORTFOLIO_CONFIG = {
  username: "Snono-Dev",        // اسم المستخدم على GitHub
  name: "Snono-Dev",           // الاسم المعروض
  role: "Independent Programmer & Developer",
  email: "snono.dev@gmail.com",
  sessionId: "0531c92a...",     // معرّف Session
  maxProjects: 3,                // عدد المشاريع في أعلى الصفحة
  hideForks: true,               // إخفاء المستنسخات
  hideArchived: true             // إخفاء المؤرشفة
};
```

### 2. البيانات والمحتوى — `about.md` و `about.en.md`

هذا الملف يخدم **هدفين**: بيانات الموقع + محتوى صفحة "عني".

```md
---
name: Snono-Dev
role: مبرمج ومطور مستقل
github_username: Snono-Dev
email: snono.dev@gmail.com
session_id: "0531c92a..."
eyebrow: مبرمج مستقل / مطور ويب
hero_title: أحوّل الأفكار إلى
hero_emphasis: واجهات لها أثر.
hero_copy: أصمّم وأبني تجارب ويب سريعة وواضحة.
skills: JavaScript, React, HTML / CSS, UI Design, Node.js
---

# عني

أنا **Snono-Dev**، مبرمج ومطور مستقل...

## كيف أعمل

- أبدأ بفهم المشكلة واحتياجات المستخدمين.
```

**الحقول المتاحة في Frontmatter:**

| الحقل | الوصف |
|---|---|
| `name` | الاسم المعروض |
| `role` | المسمى الوظيفي |
| `github_username` | اسم المستخدم على GitHub (يجلب المشاريع تلقائياً) |
| `email` | البريد الإلكتروني |
| `session_id` | معرّف Session (يُظهر زر "محادثة سريعة") |
| `eyebrow` | نص صغير فوق العنوان الرئيسي |
| `hero_title` | الجزء الأول من العنوان الرئيسي |
| `hero_emphasis` | الجزء الثاني (يظهر بالبرتقالي) |
| `hero_copy` | النص التوضيحي تحت العنوان |
| `skills` | المهارات مفصولة بفاصلة |

**النص بعد `---` الثاني** هو محتوى قسم "عني" — يدعم العناوين والقوائم والنص العريض.

### 3. ملف كل مشروع — `about.md` في المستودع

ضع ملف `about.md` في **جذر كل مستودع** تريد تحسين عرضه:

```md
---
visible: true
service_url: https://your-service.example
repository_url: https://github.com/username/repository
---

وصف قصير للمشروع يظهر في البطاقة.
```

| الحقل | الوصف |
|---|---|
| `visible` | `true`/`false` — التحكم بالظهور (افتراضياً true) |
| `service_url` | رابط الخدمة المنشورة (يُظهر زر "زيارة الخدمة") |
| `repository_url` | رابط المستودع (يُستخدم تلقائياً إذا لم يُحدد) |

**قيم إخفاء مدعومة:** `false`, `no`, `0`, `off`, `hidden`, `draft`, `disabled`

---

## التواصل عبر Session

1. احصل على معرّف Session من تطبيق [Session](https://getsession.org)
2. ضعه في `session_id` داخل `about.md` و `about.en.md`
3. سيظهر زر "محادثة سريعة" في الصفحة الرئيسية
4. صفحة Session تعرض: رمز QR للمسح + المعرّف النصي مع زر نسخ + رابط تحميل التطبيق

---

## صفحة تفاصيل المشروع

كل بطاقة مشروع تفتح صفحة ديناميكية تعرض:

- محتوى `README.md` (عربي) أو `README.en.md` (إنجليزي) — حسب لغة الزائر
- زر "المستودع" — يفتح رابط GitHub
- زر "زيارة الخدمة" — يظهر فقط إذا كان `service_url` موجوداً

---

## تحسين SEO

الموقع محسّن بالكامل لمحركات البحث:

- **Meta tags** — description, keywords, author, robots, theme-color
- **Open Graph** — og:type, og:title, og:description, og:image, og:locale
- **Twitter Card** — twitter:card, twitter:title, twitter:description
- **JSON-LD** — Schema.org Person + knowsAbout + sameAs
- **hreflang** — دعم عربي/إنجليزي/x-default
- **canonical URL** — يمنع المحتوى المكرر
- **sitemap.xml** — خريطة الموقع للفهرسة
- **robots.txt** — يحظر `session.html` من الزحف
- **Schema.org microdata** — AboutPage, CollectionPage, ContactPage

---

## النشر على GitHub Pages

1. أنشئ مستودعاً جديداً وارفع هذه الملفات إليه
2. من **Settings → Pages** اختر النشر من فرع `main` والمجلد `/(root)`
3. افتح الرابط الذي يوفره GitHub

> يمكن ترك `username` فارغاً في `config.js` عند النشر على `USERNAME.github.io` — سيتعرف الموقع على الاسم من الرابط تلقائياً.

> لا يمكن لواجهة GitHub العامة عرض المستودعات الخاصة، لذلك ستظهر المستودعات العامة فقط.

---

## الترجمة

- اللغة الافتراضية: **العربية**
- زر `EN` / `ع` في الهيدر للتبديل فوراً
- يُحفظ الاختيار في `localStorage`
- يُحدّث `<html lang>` و `dir` تلقائياً (RTL/LTR)
- جميع Meta tags تتحدث مع اللغة (OG, Twitter, description)
