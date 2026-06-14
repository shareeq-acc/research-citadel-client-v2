import {
  Lock, FileText, Users, Sparkles, MessageSquare, PenLine,
  Search, Shield, BookOpen, LayoutGrid,
} from "lucide-react";

export const TICKER_ITEMS = [
  "Research Vaults",
  "Grounded AI Q&A",
  "Real-Time Collab",
  "PDF + Web Articles",
  "Role-Based Access",
  "AI Insight Extraction",
  "Team Chat",
  "Live Annotations",
];

export const PROCESS_STEPS = [
  {
    num: "01",
    tag: "SETUP",
    title: "Create a Research Vault",
    desc: "Spin up a shared workspace for your project. Set it public or private, add a description, and invite your team in seconds.",
    chips: ["Public or Private", "Invite Your Team", "Role-Based Access"],
    url: "app.researchcitadel.com/dashboard",
  },
  {
    num: "02",
    tag: "INGEST",
    title: "Upload Your Sources",
    desc: "Drag in PDFs or paste web article URLs. Full text is extracted and semantically indexed — every source becomes queryable by AI.",
    chips: ["PDF Files", "Web Articles", "Auto-Indexed"],
    url: "app.researchcitadel.com/vault/ai-foundations/sources",
  },
  {
    num: "03",
    tag: "ANALYSE",
    title: "Get AI Insights & Summaries",
    desc: "Extract research problem, methodology, key findings, contributions, limitations, and future work — grounded in the source.",
    chips: ["AI Summaries", "Key Findings", "Limitations"],
    url: "app.researchcitadel.com/vault/ai-foundations/sources?tab=insights",
  },
  {
    num: "04",
    tag: "QUERY",
    title: "Ask the AI Anything",
    desc: "Select which sources to query and ask free-form questions. Answers come only from your documents — no outside knowledge.",
    chips: ["Free-form Q&A", "Source-scoped", "Quick Prompts"],
    url: "app.researchcitadel.com/vault/ai-foundations/qa",
  },
  {
    num: "05",
    tag: "ANNOTATE",
    title: "Annotate & Collaborate Live",
    desc: "Write Markdown notes mapped to exact pages and sections. Your team sees changes in real time with conflict detection.",
    chips: ["Live Co-editing", "Conflict Resolver", "Version History"],
    url: "app.researchcitadel.com/vault/ai-foundations/workspace",
  },
  {
    num: "06",
    tag: "COMMUNICATE",
    title: "Chat & Coordinate as a Team",
    desc: "Each vault has a dedicated chat stream. @mention teammates, reply to threads, and reference sources inline.",
    chips: ["@mentions", "Threaded Replies", "Slash Commands"],
    url: "app.researchcitadel.com/vault/ai-foundations/chat",
  },
];

export const COLLAB_ITEMS = [
  {
    badge: "MULTIPLAYER",
    title: "Live Multiplayer Editing",
    desc: "Co-write and highlight documents simultaneously. See exact cursors, active text selections, and paragraph focuses in real time.",
    preview: "presence",
  },
  {
    badge: "TEAM CHAT",
    title: "Contextual Vault Chat",
    desc: "Discuss sources directly inside the vault with threaded replies, teammate @mentions, and document references.",
    preview: "chat",
  },
  {
    badge: "ACCESS ROLES",
    title: "Granular Member Roles",
    desc: "Invite team members and assign secure Owner, Contributor, or Viewer privileges to manage editing and annotation permissions.",
    preview: "roles",
  },
];

export const FEATURES = [
  { icon: Lock, title: "Research Vaults", desc: "Isolated workspaces per project with public/private settings and granular roles." },
  { icon: BookOpen, title: "Citation Library", desc: "Upload PDFs or add web URLs. Store metadata — authors, journal, year, DOI — searchable." },
  { icon: Sparkles, title: "AI Insights", desc: "Auto-extract problems, methodology, findings, contributions, and limitations from every paper." },
  { icon: Search, title: "Grounded Q&A", desc: "Ask anything about your sources. Answers come only from your corpus — zero hallucinations." },
  { icon: PenLine, title: "Live Annotations", desc: "Markdown notes mapped to pages and sections with real-time collaboration." },
  { icon: MessageSquare, title: "Team Chat", desc: "Per-vault chat with threading, replies, and slash commands to reference sources." },
];

export const ROLES = [
  {
    name: "OWNER",
    badge: "FULL ACCESS",
    badgeClass: "bg-[#ffd000] text-black",
    perms: [
      { ok: true, text: "Create & dismantle vaults" },
      { ok: true, text: "Manage all members & roles" },
      { ok: true, text: "Add, edit & delete sources" },
      { ok: true, text: "Annotate & chat" },
      { ok: true, text: "Configure vault settings" },
      { ok: true, text: "Full audit log" },
    ],
  },
  {
    name: "CONTRIBUTOR",
    badge: "EDIT ACCESS",
    badgeClass: "bg-[#00b8d9] text-black",
    perms: [
      { ok: false, text: "Vault management" },
      { ok: true, text: "Invite & message members" },
      { ok: true, text: "Add & edit sources" },
      { ok: true, text: "Annotate & chat" },
      { ok: false, text: "Vault settings" },
      { ok: true, text: "View audit log" },
    ],
  },
  {
    name: "VIEWER",
    badge: "READ ONLY",
    badgeClass: "bg-stone-300 text-black",
    perms: [
      { ok: false, text: "Vault management" },
      { ok: false, text: "Member management" },
      { ok: false, text: "Add or edit sources" },
      { ok: true, text: "Read annotations & chat" },
      { ok: false, text: "Vault settings" },
      { ok: true, text: "View summaries & insights" },
    ],
  },
];

export const PREVIEW_TABS = [
  { id: "dash", label: "Dashboard", icon: LayoutGrid, url: "app.researchcitadel.com/dashboard" },
  { id: "cites", label: "Citations", icon: BookOpen, url: "app.researchcitadel.com/vault/ai-foundations/sources" },
  { id: "ai", label: "AI Q&A", icon: Sparkles, url: "app.researchcitadel.com/vault/ai-foundations/qa" },
  { id: "team", label: "Team", icon: Users, url: "app.researchcitadel.com/vault/ai-foundations/members" },
];

export const AI_TYPEWRITER_TEXT =
  "Based on Vaswani et al. (2017), the Transformer's core innovation is self-attention — replacing recurrence entirely, enabling parallel computation and capturing long-range dependencies directly.";

export const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    desc: "For individuals and small teams getting started with collaborative research.",
    popular: false,
    features: [
      { included: true, text: "1 Vault" },
      { included: true, text: "Up to 3 members" },
      { included: true, text: "PDF + web article sources" },
      { included: true, text: "Basic AI Q&A (limited)" },
      { included: true, text: "Annotations & team chat" },
      { included: false, text: "Multiple vaults" },
      { included: false, text: "Unlimited AI queries" },
      { included: false, text: "Advanced audit logs" },
    ],
    cta: "Get Started Free",
    ctaStyle: "outline" as const,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    desc: "For serious research teams who need unlimited vaults and full AI capabilities.",
    popular: true,
    features: [
      { included: true, text: "Unlimited Vaults" },
      { included: true, text: "Unlimited members" },
      { included: true, text: "PDF + web article sources" },
      { included: true, text: "Unlimited AI Q&A queries" },
      { included: true, text: "Annotations & team chat" },
      { included: true, text: "Full audit log access" },
      { included: true, text: "AI insight extraction" },
      { included: true, text: "Priority support" },
    ],
    cta: "Upgrade to Pro →",
    ctaStyle: "pro" as const,
  },
];
