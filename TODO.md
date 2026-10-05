# KURIPPU delivery outcomes

- [x] Landing page communicates “Turn documents into actions.” with product flow, pricing demonstration, roadmap, and a clear Analyze a document CTA.
- [x] Responsive workspace provides dashboard, searchable document library, upload flow, document detail, graph, source evidence, assistant, and language controls.
- [x] Upload accepts PDF, PNG, JPG, and JPEG, validates MIME/type/size/empty input, sanitizes filenames, shows explicit processing stages, and returns safe errors.
- [x] PDF upload extracts readable text and creates validated structured action data; server-side Gemini analysis is supported through GEMINI_API_KEY without exposing the key to the client, with an explicitly labelled local fallback when no key is configured.
- [x] Actions include deadlines, uncertainty, priority, status, dependencies, required documents, consequences, source text/page, confidence, and notes.
- [x] Interactive commitment graph is generated from current action dependencies with zoom, pan, clickable nodes, status state styling, and selected-action detail.
- [x] Action status updates recalculate document progress and dependent readiness; dashboard and graph consume current state.
- [x] What am I forgetting? derives overdue, blocked, upcoming, missing-document, and high-risk signals from stored action state.
- [x] Source-grounded assistant supports English, Tamil, and Tanglish-friendly questions, returns citations where available, and refuses to invent missing information.
- [x] API routes, route manifest, README, .env.example, Dockerfile, health endpoint, TypeScript diagnostics, and production build are present.
- [x] Desktop and mobile preview screenshots plus end-to-end API checks completed successfully.

## Known limits

- Demo persistence is process-local until the managed database adapter is connected.
- Image OCR is reported as a safe configuration limitation; text-based PDF extraction is implemented.
- Authentication, calendar/email integrations, payments, WhatsApp/mobile clients, and enterprise automation remain roadmap items.
