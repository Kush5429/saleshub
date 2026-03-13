# DoubleTick Sales Intelligence Hub

> An AI-powered internal sales enablement platform for the DoubleTick team — built on React, Vercel serverless functions, and MongoDB Atlas.

**Live:** [sales-hub-one.vercel.app](https://sales-hub-one.vercel.app)  
**Stack:** React 19 · Vite · Vercel Serverless · MongoDB Atlas · Cloudinary · JWT Auth · Groq / Gemini / Anthropic

---

## What This Is

A centralised internal platform for DoubleTick sales reps and relationship managers to access product knowledge, pricing, demo resources, and AI-powered sales assistance — all behind role-based authentication.

---

## Features

### 🔐 Authentication & Access Control
- Email/password login with JWT (7-day tokens)
- Two roles: **Admin** (full access + content management) and **Sales** (read + AI tools)
- In-memory rate limiting on login (10 attempts / 60s per IP)
- Secure bcrypt password hashing

---

### 📚 Knowledge Hub (5 Modules)

#### Docs Hub
- Centralised repository of all product PDFs and documents
- Category filtering: Overview, Onboarding, Sales, Technical, Pricing
- Full-text search within docs
- Pinned documents (e.g. DoubleTick for RM & Sales Teams deck)
- Admin: upload, edit, delete documents via Cloudinary

#### Pricing Module
- All DoubleTick and QuickSell plans with pricing, features, ICP profiles
- Monthly, quarterly, and annual plan views
- WhatsApp Conversation Costs reference card
- Admin: add/edit/remove plans

#### Add-ons & Services
- Full catalogue of purchasable add-ons with compatible plan badges
- Categories: Support, Implementation, Compliance, CRM Integrations, WABA
- Admin: add/edit/remove add-ons

#### Video Library
- YouTube video embeds with thumbnail previews
- Supports any YouTube URL format (watch, short, channel links)
- Categories: Demo, Training, Overview
- Admin: add/edit/remove videos

#### Resources Hub
- Quick-access links to all external resources
- Categories: Documentation, Learning, Compliance, App Stores, Reviews, Support
- Admin: add/edit/remove resources

---

### ⭐ Feature Registry
- Showcase of key DoubleTick product features and releases
- Horizontal card layout with SVG illustrations
- Demo links per feature
- Engagement tracking: views and demo requests logged automatically

---

### 🔍 Global Search
- Searches across all 5 content types simultaneously (docs, features, videos, resources, pricing)
- Results grouped by content type
- Debounced input with instant feedback

---

### 🤖 AI Layer (Phase 4)

#### AI Playbook
- ChatGPT-style assistant powered by your internal knowledge base
- Asks retrieve context from MongoDB (docs, features, videos, pricing, resources) and send it to the LLM
- Suggested starter questions for new users
- Inline markdown rendering (bold, code, bullets, headings)
- Source attribution — shows exactly which knowledge assets informed each answer
- All queries logged to `AIQuery` collection for analytics
- **LLM Provider:** Groq (Llama 3.3 70B) → Gemini 2.0 Flash → Anthropic Claude Haiku (priority order, uses first available key)

#### Call Intelligence
- Paste any call transcript or meeting notes
- Automatically extracts:
  - Features mentioned
  - Customer objections
  - Customer interests
  - Suggested next steps
- Load Example button for demos
- All analyses saved to `DealInsights` collection

#### Knowledge Graph
- Link any content assets to each other (Feature → Doc → Video → Pricing → Resource)
- Relation types: Related, Demo of, Docs for, Priced at, Resource for
- Admin: create and delete relations
- Sales: browse and view all linked content per asset

---

### 📊 Sales Intelligence Dashboard (Admin Only)
- Total engagements, features tracked, recent event count
- Top content by type over last 30 days (with resolved names)
- Event breakdown by type (view, play, open, demo request)
- Feature adoption metrics (views, mentions, demo requests per feature)
- Recent activity feed with content names

---

### 📡 Engagement Tracking
- Automatic fire-and-forget event tracking across modules:
  - **Pricing:** view events on page load
  - **Add-ons:** view events on hover
  - **Video Library:** play events on video open
  - **Feature Registry:** view events on mount, demo_request on button click
- All events stored in `EngagementEvent` collection with userId, contentType, contentId, eventType, timestamp

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, CSS variables (dark theme) |
| Backend | Vercel Serverless Functions (single ESM handler) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jose), bcryptjs |
| Media | Cloudinary (PDF/file uploads) |
| AI — Primary | Groq API (Llama 3.3 70B) |
| AI — Fallback 1 | Google Gemini 2.0 Flash |
| AI — Fallback 2 | Anthropic Claude Haiku |
| Hosting | Vercel (frontend + API) |
| Fonts | DM Sans + Syne (Google Fonts) |

---

## Database Collections

| Collection | Purpose |
|---|---|
| `Users` | Auth credentials and roles |
| `Documentation` | Docs Hub entries |
| `PricingPlan` | Pricing plans |
| `Addon` | Add-on services |
| `Video` | Video library |
| `Resource` | Resource links |
| `FeatureRelease` | Feature registry |
| `EngagementEvent` | All user engagement events |
| `FeatureMetric` | Aggregated per-feature metrics |
| `AIQuery` | AI Playbook query history |
| `DealInsight` | Call Intelligence results |
| `ContentRelation` | Knowledge graph relationships |

---

## API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/login` | Authenticate user | Public |
| POST | `/api/register` | Create new user | Public |
| GET | `/api/me` | Get current user | Any |
| GET | `/api/search?q=` | Search all content | Any |
| POST | `/api/engage` | Log engagement event | Any |
| GET | `/api/intelligence` | Analytics dashboard data | Any |
| GET/POST/PUT/DELETE | `/api/docs` | Docs CRUD | GET: Any, mutate: Admin |
| GET/POST/PUT/DELETE | `/api/pricing` | Pricing CRUD | GET: Any, mutate: Admin |
| GET/POST/PUT/DELETE | `/api/addons` | Add-ons CRUD | GET: Any, mutate: Admin |
| GET/POST/PUT/DELETE | `/api/videos` | Videos CRUD | GET: Any, mutate: Admin |
| GET/POST/PUT/DELETE | `/api/resources` | Resources CRUD | GET: Any, mutate: Admin |
| GET/POST/PUT/DELETE | `/api/features` | Features CRUD | GET: Any, mutate: Admin |
| GET/POST | `/api/feature-metrics/:action` | Feature analytics | Any |
| POST | `/api/ai-playbook` | AI sales assistant | Any |
| GET | `/api/ai-queries` | AI query history | Any |
| POST | `/api/call-intelligence` | Analyze transcript | Any |
| GET | `/api/deal-insights` | Deal insights history | Any |
| GET/POST/DELETE | `/api/relations` | Knowledge graph | GET: Any, mutate: Admin |

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-random-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...           # Primary LLM (free)
GEMINI_API_KEY=...         # Fallback LLM (free)
ANTHROPIC_API_KEY=...      # Fallback LLM (paid)
```

---

## Project Structure

```
├── api/
│   └── index.js              # Single Vercel serverless handler (~450 lines)
├── src/
│   ├── App.jsx               # Root with auth gate + mobile layout
│   ├── index.css             # Global styles + responsive utilities
│   ├── context/
│   │   └── AuthContext.jsx   # JWT auth state
│   ├── components/
│   │   ├── Sidebar.jsx       # Nav with hamburger menu (mobile)
│   │   ├── Icon.jsx          # SVG icon library
│   │   ├── Modal.jsx         # Reusable modal
│   │   └── UI.jsx            # Shared UI primitives
│   ├── modules/
│   │   ├── Dashboard.jsx
│   │   ├── DocsHub.jsx
│   │   ├── PricingModule.jsx
│   │   ├── AddonsModule.jsx
│   │   ├── VideoLibrary.jsx
│   │   ├── ResourcesHub.jsx
│   │   ├── FeatureRegistry.jsx
│   │   ├── AIPlaybook.jsx        # AI chat interface
│   │   ├── CallIntelligence.jsx  # Transcript analyzer
│   │   ├── KnowledgeGraph.jsx    # Content relations
│   │   ├── IntelligenceDashboard.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── SearchResults.jsx
│   │   └── LoginPage.jsx
│   ├── hooks/
│   │   └── useApiData.js
│   └── utils/
│       ├── api.js            # All API calls with auth injection
│       └── engage.js         # Fire-and-forget engagement tracking
├── vercel.json               # Routing rewrites
└── package.json
```

---

## Development

```bash
npm install
npm run dev        # Local dev server
npm run build      # Production build
```

---

## Deployment

Push to `main` branch on GitHub → Vercel auto-deploys.

```bash
git add .
git commit -m "your message"
git push
```

---

*Built for the DoubleTick internal sales team. Not for public distribution.*
