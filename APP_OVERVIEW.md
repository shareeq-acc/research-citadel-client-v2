# Research Citadel — App Overview

## What is it?

Research Citadel is a collaborative research platform. It helps teams organize academic papers, take notes together, ask AI questions about their documents, and communicate — all in one place.

---

## Core Concepts

| Term | What it means |
|---|---|
| **Vault** | A shared workspace for a research project. Can be public or private. Each vault holds your papers, notes, team chat, and activity history. |
| **Source** | A document inside a vault — either a PDF upload or a web article URL. You can add authors, publication, year, and DOI. |
| **Annotation** | A Markdown note you write about a source. Linked to a specific page or section. Supports live co-editing with your team. |
| **Annotation Workspace** | A split-screen editor: write Markdown on the left, see the formatted preview on the right. AI can help improve your writing. |
| **Passport** | A membership card for a vault. Shows your name, role, vault alias, and a unique QR code that can be publicly verified. |
| **Q&A** | Ask questions about your uploaded sources. The AI only answers from your documents — no guessing. Sources must be indexed first. |
| **Colloquium** | The chat room inside each vault. Supports real-time messages, replies, @mentions, and slash commands. |
| **Insights** | AI-extracted breakdown of a source: research problem, methodology, key findings, limitations, and more. |
| **AI Summary** | A generated summary of a source. You choose the length: short, medium, or long. |
| **Audit Trail** | A log of all activity in a vault — who added sources, wrote notes, changed settings, etc. |
| **AI Usage** | AI features count against daily and weekly limits. Free plan has a small limit; Pro plan has a much higher one. |
| **Citation** | Auto-generated reference text in APA, MLA, Chicago, BibTeX, or IEEE format. You can copy or edit it. |

---

## Member Roles

| Role | What they can do |
|---|---|
| **Owner** | Full control — manage vault, members, sources, notes, settings, and delete the vault |
| **Contributor** | Add/edit sources and notes, invite members, use chat — cannot manage vault settings |
| **Viewer** | Read-only — can view summaries, notes, and chat, but cannot add or edit anything |

---

## Pages

### Public pages (no login needed)

- **`/`** and **`/landing`** — Homepage with feature overview, pricing, and sign-up
- **`/auth`** — Login, register, forgot password, and password reset
- **`/verify-email/[token]`** — Email verification link (sent after registration)
- **`/invitation/[token]`** — Accept or decline a vault invitation
- **`/verify/passport/[barcode]`** — Public QR code verification for vault passports

### Dashboard (login required)

- **`/dashboard`** — Main page: see all your vaults on the left, work inside the active vault on the right
- **`/source/[vaultId]/[sourceId]`** — Source detail: view AI summaries, insights, citations, and annotations for a specific paper
- **`/annotation-workspace/[vaultId]/[sourceId]`** — Write or edit an annotation with a live Markdown editor
- **`/annotation/[vaultId]/[sourceId]/[annotationId]`** — Read a finished annotation with a reference panel on the side
- **`/passport/[vaultId]`** — Edit and view your membership card for a vault
- **`/settings`** — Edit your profile (name, avatar) and notification preferences
- **`/subscription`** — View your AI usage and change your plan (Free or Pro)

---

## Dashboard Tabs (inside a vault)

1. **Stats** — Activity count, contributor count, top contributor, contribution heatmap (12 weeks), and per-member bar chart
2. **Sources** — List of all papers/articles in the vault. Add new ones via PDF upload or URL
3. **Annotations** — All notes written in this vault, with filters by author, page, and sort order
4. **Researchers** — Vault members and their roles. Owners can invite or remove members
5. **Chat** — Real-time vault chat (Colloquium)
6. **Q/A** — Ask the AI questions about indexed sources
7. **Audits** — Filterable activity log with date range and category filters
8. **Settings** — Vault name, description, privacy, danger zone (exit or delete vault), and passport (ID card)

---

## Features

- **Real-time collaboration** — Multiple people can edit annotations at the same time. Conflicts are detected and shown side-by-side for resolution
- **AI powered** — Summaries, structured insights, Q&A, and annotation enhancement
- **Grounded AI** — Q&A answers only use your own documents. No hallucinations
- **Citations** — Generate properly formatted references in multiple academic styles
- **Notifications** — Get alerts for chat mentions, vault invitations, AI job completions, and security events
- **Passport / QR** — Each vault member gets a verifiable ID card with a scannable QR code
- **Audit log** — Full history of vault activity, filterable and paginated

---

## Plans

| | Free | Pro ($29/month) |
|---|---|---|
| Vaults | 1 | Unlimited |
| Members per vault | Up to 3 | Unlimited |
| AI queries (daily) | Limited | ~50× more |
| AI queries (weekly) | Limited | ~100× more |
| Audit logs | Basic | Full access |
| Insights extraction | ✓ | ✓ |
| Priority support | ✗ | ✓ |

---

## Technical Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **State:** React Context (`AppContext`)
- **HTTP:** Axios with `withCredentials` (JWT via HTTP-only cookie)
- **Real-time:** Socket.IO (`/collaboration` namespace)
- **Design:** Neobrutalist design system (custom Tailwind tokens)
- **Avatar:** DiceBear presets + custom SVG vector builder + Cloudinary uploads
- **QR Code:** `react-qr-code`
