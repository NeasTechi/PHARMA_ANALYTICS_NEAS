# Pharma Analytics · NEAS

A professional pharma sales intelligence dashboard built with React, Vite, Tailwind CSS, and Supabase. Track revenue, profit, items sold, detect anomalies with AI, and manage sales data — all in a responsive, secure, multi-page web app.

![Pharma Analytics](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite) ![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

## ✨ Features

- **Multi-page dashboard** — Overview, Analytics, AI Insights, Data Management, Settings
- **KPI cards** with month-over-month comparison deltas
- **Charts** — Bar, Line, and Pie (Recharts) with date/category filters
- **Anomaly detection** — Z-score + month-over-month spike/drop detection
- **AI Insights** — Groq-powered anomaly explanations and natural-language Q&A
- **Admin CRUD** — add/delete sales rows (role-gated via Supabase Auth + RLS)
- **Export** — CSV and PDF
- **Responsive** — mobile, tablet, and desktop layouts
- **Dark mode** — persisted preference
- **SEO-ready** — per-page meta tags, Open Graph, sitemap, robots.txt
- **Security** — CSP headers, rate limiting, RLS, secure edge function
- **Privacy** — privacy policy page, cookie consent banner

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 3 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend / DB | Supabase (PostgreSQL, Auth, Edge Functions) |
| AI | Groq (gpt-oss-20b) via Supabase Edge Function |
| Testing | Vitest + Testing Library |

## 📁 Project Structure

```
PHARMA_ANALYTICS_NEAS/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/       # Layout, Charts, Admin, Toast, etc.
│   │   ├── pages/            # Overview, Analytics, Insights, Data, Settings, Privacy
│   │   ├── hooks/            # useSalesData, useToast, useTheme
│   │   ├── lib/              # supabaseClient, auth, ai, anomalies
│   │   └── test/             # Vitest setup
│   ├── public/               # robots.txt, sitemap.xml, assets
│   └── ...config files
├── backend/
│   └── supabase/
│       ├── functions/analyze/ # Edge function (Groq AI)
│       └── supabase_rls.sql   # Row Level Security policies
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- (Optional) A Groq API key for AI features

### 1. Clone & install
```bash
git clone https://github.com/NeasTechi/PHARMA_ANALYTICS_NEAS.git
cd PHARMA_ANALYTICS_NEAS/frontend
npm install
```

### 2. Configure environment
Copy `frontend/.env.example` to `frontend/.env` and fill in:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 4. Run tests
```bash
npm run test
```

## 🗄️ Backend Setup (Supabase)

1. **Create an admin user**: Supabase Dashboard → Authentication → Users → Add user
2. **Apply RLS**: SQL Editor → run `backend/supabase_rls.sql`
3. **Deploy edge function** (for AI):
   ```bash
   cd backend
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase secrets set GROQ_API_KEY=gsk_your-key
   supabase functions deploy analyze
   ```

## 🧪 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run preview` | Preview production build |

## 🔒 Security

- Supabase RLS enforces role-based access (admins only can write)
- Groq API key stored as a Supabase secret (never in client bundle)
- CSP + security headers in `index.html`
- Rate limiting on edge function (20 req/min per IP)
- Input validation & sanitization on all forms

## 🔐 Privacy

- No tracking cookies (local storage only for preferences/session)
- Privacy policy at `/privacy`
- Cookie consent banner
- Data stored in your Supabase project — you control deletion

## 📄 License

MIT © NEASTECH