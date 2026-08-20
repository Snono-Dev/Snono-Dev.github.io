# Snono-Dev Portfolio

A personal bilingual (AR/EN) portfolio running on **GitHub Pages** — fully static, no Node.js, no server, no build tools. Projects are fetched automatically from the **GitHub API**, with bilingual translation, **Session** messaging, and full SEO optimization.

---

## Features

- **Fully static** — HTML + CSS + JS only, no hidden files, no build step
- **GitHub project fetching** — repositories pulled automatically with Forks/Archived filtering
- **Bilingual translation** — AR/EN with one click, automatic RTL/LTR
- **Session messaging** — QR code + ID copy + app download link
- **Full SEO** — Meta tags, Open Graph, Twitter Card, JSON-LD, sitemap.xml, robots.txt
- **Responsive design** — works on all screens from mobile to desktop
- **3-layer cache** — GitHub API → localStorage → embedded defaults
- **XSS protection** — all inputs sanitized
- **Zero dependencies** — no external libraries, all custom code (~57 KB)

---

## File Structure

```
Snono-Dev/
├── index.html          Home page
├── project.html        Project detail page
├── session.html        Session contact page
├── styles.css          Styles
├── config.js           Configuration
├── script.js           Main page engine (translation + fetching + rendering)
├── project.js          Project page logic
├── session.js          Session page logic
├── about.md            Arabic data + content (frontmatter + body)
├── about.en.md         English data + content
├── sitemap.xml         Sitemap for search engines
├── robots.txt          Crawl rules for search engines
├── README.md           Arabic readme
└── README.en.md        This file (English)
```

---

## Customization

### 1. Settings — `config.js`

```js
window.PORTFOLIO_CONFIG = {
  username: "Snono-Dev",        // GitHub username
  name: "Snono-Dev",           // Display name
  role: "Independent Programmer & Developer",
  email: "snono.dev@gmail.com",
  sessionId: "0531c92a...",     // Session ID
  maxProjects: 3,                // Featured projects count
  hideForks: true,               // Hide forks
  hideArchived: true             // Hide archived repos
};
```

### 2. Data & Content — `about.md` and `about.en.md`

This file serves **two purposes**: site data + "About me" page content.

```md
---
name: Snono-Dev
role: Independent Programmer & Developer
github_username: Snono-Dev
email: snono.dev@gmail.com
session_id: "0531c92a..."
eyebrow: INDEPENDENT PROGRAMMER / WEB DEVELOPER
hero_title: I turn ideas into
hero_emphasis: interfaces that matter.
hero_copy: I design and build fast, clear web experiences.
skills: JavaScript, React, HTML / CSS, UI Design, Node.js
---

# About me

I'm **Snono-Dev**, an independent programmer and developer...

## How I work

- Start by understanding the problem and its users.
```

**Available Frontmatter fields:**

| Field | Description |
|---|---|
| `name` | Display name |
| `role` | Job title |
| `github_username` | GitHub username (fetches projects automatically) |
| `email` | Email address |
| `session_id` | Session ID (shows "Quick chat" button) |
| `eyebrow` | Small text above the hero title |
| `hero_title` | First part of the main title |
| `hero_emphasis` | Second part (shown in orange) |
| `hero_copy` | Subtitle text below the title |
| `skills` | Comma-separated skills |

**The text after the second `---`** is the "About me" section content — supports headings, lists, and bold text.

### 3. Per-project file — `about.md` in each repository

Place an `about.md` file in the **root of each repository** you want to enhance:

```md
---
visible: true
service_url: https://your-service.example
repository_url: https://github.com/username/repository
---

Short project description shown in the portfolio card.
```

| Field | Description |
|---|---|
| `visible` | `true`/`false` — visibility control (default: true) |
| `service_url` | Live service URL (shows "Visit service" button) |
| `repository_url` | Repository URL (auto-detected if not set) |

**Supported hide values:** `false`, `no`, `0`, `off`, `hidden`, `draft`, `disabled`

---

## Session Messaging

1. Get a Session ID from the [Session](https://getsession.org) app
2. Add it as `session_id` in `about.md` and `about.en.md`
3. A "Quick chat" button will appear on the homepage
4. The Session page displays: QR code for scanning + text ID with copy button + app download link

---

## Project Detail Page

Each project card opens a dynamic page displaying:

- `README.md` (Arabic) or `README.en.md` (English) content — based on visitor language
- "Repository" button — links to GitHub
- "Visit service" button — shown only when `service_url` is present

---

## SEO Optimization

Fully optimized for search engines:

- **Meta tags** — description, keywords, author, robots, theme-color
- **Open Graph** — og:type, og:title, og:description, og:image, og:locale
- **Twitter Card** — twitter:card, twitter:title, twitter:description
- **JSON-LD** — Schema.org Person + knowsAbout + sameAs
- **hreflang** — AR/EN/x-default language alternates
- **canonical URL** — prevents duplicate content
- **sitemap.xml** — sitemap for indexing
- **robots.txt** — blocks `session.html` from crawling
- **Schema.org microdata** — AboutPage, CollectionPage, ContactPage

---

## Deploying to GitHub Pages

1. Create a new repository and push these files to it
2. Go to **Settings → Pages** and select deploy from branch `main` with folder `/(root)`
3. Open the link GitHub provides

> You can leave `username` empty in `config.js` when deploying to `USERNAME.github.io` — the site will auto-detect it from the URL.

> GitHub's public API cannot list private repositories, so only public repos will appear.

---

## Translation

- Default language: **Arabic**
- `EN` / `AR` button in the header for instant switching
- Choice is saved in `localStorage`
- `<html lang>` and `dir` update automatically (RTL/LTR)
- All meta tags update with language change (OG, Twitter, description)
