# KURIPPU

> Turn documents into actions.

KURIPPU is a document-to-action intelligence MVP. Instead of stopping at “what does this say?”, it surfaces commitments, deadlines, dependencies, priority, and the next step.

## What exists in this MVP

- Premium landing page and workspace shell
- Responsive dashboard with critical, upcoming, overdue and completed work
- Drag-and-drop PDF/PNG/JPG/JPEG uploader with validation and processing states
- Server-side text extraction for PDFs and basic image/OCR guidance
- Structured document analysis adapter with Gemini support through `GEMINI_API_KEY`
- Safe local fallback analysis that is explicitly labelled when a model key is unavailable
- Action plans with priorities, deadlines, prerequisites, consequences, confidence and source references
- Interactive SVG commitment graph with zoom, pan, selection, and dependency highlighting
- Dynamic action status updates and dependent-task readiness
- “What am I forgetting?” risk panel derived from current action state
- Source-grounded document assistant with English, Tamil and Tanglish-friendly rules
- Searchable document library and clearly labelled demo documents

## Stack

- React + TypeScript + Vite
- Express + Multer + `pdf-parse`
- Zod validation
- Managed Webdev server/database capability ready for durable persistence

The current demo repository uses a modular in-memory repository so the core experience stays runnable without a database provisioned locally. The repository boundary is ready for a managed database adapter.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

- `GEMINI_API_KEY` — optional server-side Gemini key. When present, uploaded text is sent to Gemini for structured analysis. The key is never bundled for the browser.
- `DATABASE_URL` — reserved for the managed database adapter.
- `PORT` — local server port, defaults to `3000`.

## Hosting on Vercel

KURIPPU is pre-configured for Vercel deployment with serverless Express API handlers and a Vite single-page application.

### Option 1: Deploy via GitHub (Recommended)
1. Initialize git and push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kurippu.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your `kurippu` repository.
4. Framework Preset will auto-detect as **Vite**.
5. (Optional) Add your `GEMINI_API_KEY` under **Environment Variables**.
6. Click **Deploy**.

### Option 2: Deploy via Vercel CLI
```bash
vercel login
vercel --prod
```

## API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/documents`
- `POST /api/documents/upload`
- `GET /api/documents/:id`
- `GET /api/documents/:id/actions`
- `GET /api/documents/:id/graph`
- `PATCH /api/actions/:id`
- `POST /api/chat`

## Demo sequence

1. Open the landing page and choose **Analyze a document**.
2. Open the internship demo document or upload a PDF.
3. Inspect extracted deadlines and the action plan.
4. Open **Commitment graph**, select a node, and complete **Upload ID proof**.
5. Watch the dependent task become ready and progress update.
6. Ask `Indha document-la next naan enna pannanum?` in the assistant.
7. Open **What am I forgetting?** to surface incomplete prerequisites.

## Error behavior

Invalid file type, oversized files, empty/corrupt PDFs, failed model responses, and missing readable text return safe, user-facing messages without raw stack traces.

## Limitations

- Local demo persistence is process-local until the managed database adapter is connected.
- Image OCR is represented as a safe extraction guidance state; PDF text extraction is the reliable path in this MVP.
- Live Gemini analysis requires a server-side `GEMINI_API_KEY`.
- Authentication, calendar/email integrations, payments, WhatsApp/mobile apps and enterprise automation are future work.

## Future roadmap

1. Document intelligence foundation (current)
2. Email/calendar ingestion and smart reminders
3. WhatsApp and mobile clients
4. Enterprise workflow automation
