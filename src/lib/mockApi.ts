/**
 * Mock API — intercepts apiFetch calls when NEXT_PUBLIC_MOCK_MODE=true
 * Returns realistic static data so the frontend can be tested without a backend.
 */

import {
  MOCK_USER,
  MOCK_VAULTS,
  MOCK_SOURCES,
  MOCK_ANNOTATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS,
  generateMockHeatmapData,
  generateMockUserStats,
} from "./mockData";

function ok(data: any, extra?: object) {
  return { success: true, data, ...extra };
}

function fail(message: string) {
  return { success: false, message };
}

// Simple in-memory stores so mutations persist during the session
let mockVaults = [...MOCK_VAULTS];
let mockSources: Record<string, any[]> = { ...MOCK_SOURCES };
let mockAnnotations: Record<string, any[]> = { ...MOCK_ANNOTATIONS };
let mockUser = { ...MOCK_USER };

let mockNotifications = [...MOCK_NOTIFICATIONS];

export function handleMockRequest(url: string, init?: RequestInit): any {
  const method = (init?.method || "GET").toUpperCase();
  let body: any = {};
  if (init?.body) {
    try { body = JSON.parse(init.body as string); } catch { /* ignore */ }
  }

  // ── AUTH ──────────────────────────────────────────────────────────────
  if (url === "/api/user/me" && method === "GET") {
    const uid = typeof window !== "undefined" ? localStorage.getItem("cid_uid_storage") : null;
    if (uid === mockUser.id) return ok(mockUser);
    return fail("Not authenticated");
  }

  if (url === "/api/user/me" && method === "PUT") {
    mockUser = { ...mockUser, ...body };
    return ok(mockUser);
  }

  if (url === "/api/auth/login" && method === "POST") {
    if (body.email === "seeri@gmail.com" && body.password === "Pass@12345") {
      return ok({ user: mockUser, token: "mock-token-xyz" });
    }
    return fail("Invalid credentials. Use seeri@gmail.com / Pass@12345");
  }

  if (url === "/api/auth/register" && method === "POST") {
    const newUser = {
      ...mockUser,
      id: "mock-user-new-" + Date.now(),
      name: body.name || "New Scholar",
      email: body.email || "new@example.com",
      isEmailVerified: false,
    };
    return ok({ user: newUser, token: "mock-token-new" });
  }

  if (url === "/api/auth/verify-otp" && method === "POST") {
    if (body.otp === "123456") {
      return ok({ token: "mock-reset-token" });
    }
    return fail("Invalid OTP. Use 123456 in test mode.");
  }

  if (url === "/api/auth/confirm-email" && method === "POST") {
    mockUser = { ...mockUser, isEmailVerified: true };
    return ok({ user: mockUser });
  }

  if (url === "/api/auth/logout" && method === "POST") {
    return ok({ message: "Logged out" });
  }

  if (url === "/api/auth/forgot-password" && method === "POST") {
    return ok({ message: "Recovery dispatch sent" });
  }

  if (url === "/api/auth/verify-email" && method === "PUT") {
    return ok({ message: "Verification email resent" });
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  if (url.startsWith("/api/notifications") && method === "GET") {
    if (url.includes("unread-count")) {
      return ok({ count: mockNotifications.filter((n) => !n.read).length });
    }
    return ok(mockNotifications);
  }

  if (url.match(/^\/api\/notifications\/[^/]+\/read$/) && method === "PATCH") {
    const id = url.split("/")[3];
    mockNotifications = mockNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    const updated = mockNotifications.find((n) => n.id === id);
    return updated ? ok(updated) : fail("Notification not found");
  }

  if (url === "/api/notifications/read-all" && method === "PATCH") {
    const unread = mockNotifications.filter((n) => !n.read).length;
    mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    return ok({ updated: unread });
  }

  // ── VAULTS ────────────────────────────────────────────────────────────
  if (url === "/api/vault" && method === "GET") {
    return ok(mockVaults);
  }

  if (url === "/api/vault" && method === "POST") {
    const newVault = {
      id: "vault-" + Date.now(),
      name: body.name || "New Vault",
      description: body.description || null,
      privacy: body.privacy || "PRIVATE",
      ownerId: mockUser.id,
      myRole: "OWNER" as "OWNER" | "CONTRIBUTOR" | "VIEWER",
      createdAt: new Date().toISOString(),
      _count: { members: 1, files: 0, sources: 0 },
      owner: { name: mockUser.name, avatar: mockUser.avatar },
      members: [],
    };
    mockVaults = [newVault, ...mockVaults];
    mockSources[newVault.id] = [];
    return ok(newVault);
  }

  const vaultMatch = url.match(/^\/api\/vault\/([^\/]+)$/);
  if (vaultMatch) {
    const vid = vaultMatch[1];
    if (method === "GET") {
      const vault = mockVaults.find((v) => v.id === vid);
      if (!vault) return fail("Vault not found");
      return ok(vault);
    }
    if (method === "PUT") {
      mockVaults = mockVaults.map((v) =>
        v.id === vid ? { ...v, ...body } : v
      );
      return ok(mockVaults.find((v) => v.id === vid));
    }
    if (method === "DELETE") {
      mockVaults = mockVaults.filter((v) => v.id !== vid);
      return ok({ deleted: true });
    }
  }

  // Vault stats
  const statsMatch = url.match(/^\/api\/vault\/([^\/]+)\/stats$/);
  if (statsMatch) {
    return ok(generateMockUserStats(statsMatch[1]));
  }

  // Vault audit
  const auditMatch = url.match(/^\/api\/vault\/([^\/]+)\/audit/);
  if (auditMatch) {
    const logs = MOCK_AUDIT_LOGS[auditMatch[1]] || [];
    const heatmapGraph = generateMockHeatmapData();
    return ok(logs, { total: logs.length, graph: heatmapGraph });
  }

  // Vault members
  const membersMatch = url.match(/^\/api\/vault\/([^\/]+)\/members$/);
  if (membersMatch && method === "POST") {
    return ok({ message: "Member added" });
  }

  // Vault chat
  const chatMatch = url.match(/^\/api\/vault\/([^\/]+)\/chat$/);
  if (chatMatch) {
    if (method === "GET") {
      return ok({
        messages: [
          {
            id: "msg-001",
            vaultId: chatMatch[1],
            userId: "mock-user-002",
            userName: "Prof. Adrian Carter",
            userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Adrian",
            content: "I've added my annotations on the attention mechanism section. The scaling factor discussion on page 4 is particularly interesting.",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            readBy: [mockUser.id],
          },
          {
            id: "msg-002",
            vaultId: chatMatch[1],
            userId: "mock-user-003",
            userName: "Elena Rostova",
            userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
            content: "Agreed. The positional encoding approach is elegant. Should we also look at the follow-up work on Relative Position Encodings?",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            readBy: [mockUser.id],
          },
        ],
        typingUsers: [],
      });
    }
    if (method === "POST") {
      return ok({
        id: "msg-" + Date.now(),
        vaultId: chatMatch[1],
        userId: mockUser.id,
        userName: mockUser.name,
        userAvatar: mockUser.avatar,
        content: body.content,
        createdAt: new Date().toISOString(),
        readBy: [],
      });
    }
  }

  // Chat typing
  const chatTypingMatch = url.match(/^\/api\/vault\/([^\/]+)\/chat\/typing$/);
  if (chatTypingMatch) return ok({});

  // Vault chats list (for navbar)
  if (url === "/api/vaults/chats") {
    return ok(
      mockVaults.map((v) => ({
        vaultId: v.id,
        vaultName: v.name,
        lastMessageText: "No recent messages.",
        lastMessageUser: null,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }))
    );
  }

  // Presence
  const presenceMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/presence$/);
  if (presenceMatch && method === "POST") {
    const simulatedPeers = body.simulate
      ? [
          { userId: "mock-user-002", name: "Prof. Adrian Carter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Adrian", status: "viewing" },
          { userId: "mock-user-003", name: "Elena Rostova", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena", status: "viewing" },
        ]
      : [];
    return ok([
      { userId: mockUser.id, name: `${mockUser.name} (You)`, avatar: mockUser.avatar, status: body.status || "viewing" },
      ...simulatedPeers,
    ]);
  }

  // ── SOURCES ───────────────────────────────────────────────────────────
  const sourcesListMatch = url.match(/^\/api\/vault\/([^\/]+)\/source$/);
  if (sourcesListMatch) {
    const vid = sourcesListMatch[1];
    if (method === "GET") {
      return ok({ sources: mockSources[vid] || [] });
    }
    if (method === "POST") {
      const newSrc = {
        id: "src-" + Date.now(),
        vaultId: vid,
        title: body.title || "Untitled Source",
        authors: body.authors || ["Unknown"],
        publication: body.publication || null,
        year: body.year || null,
        externalUrl: body.externalUrl || null,
        sourceType: body.sourceType || "PDF",
        fileId: body.file ? "file-" + Date.now() : null,
        file: body.file || null,
        extractedText: null,
        textExtractedAt: null,
        aiSummary: null,
        aiInsights: null,
        aiProcessedAt: null,
        chunksProcessed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!mockSources[vid]) mockSources[vid] = [];
      mockSources[vid] = [newSrc, ...mockSources[vid]];
      return ok(newSrc);
    }
  }

  // Source detail
  const sourceDetailMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)$/);
  if (sourceDetailMatch && method === "GET") {
    const [, vid, sid] = sourceDetailMatch;
    const src = (mockSources[vid] || []).find((s) => s.id === sid);
    if (!src) return fail("Source not found");
    return ok(src);
  }

  // Process for QA
  const qaProcessMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/process-for-qa$/);
  if (qaProcessMatch && method === "POST") {
    const [, vid, sid] = qaProcessMatch;
    if (mockSources[vid]) {
      mockSources[vid] = mockSources[vid].map((s) =>
        s.id === sid ? { ...s, chunksProcessed: true } : s
      );
    }
    return ok({ processed: true });
  }

  // Summarize
  const summarizeMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/summarize$/);
  if (summarizeMatch && method === "POST") {
    const [, vid, sid] = summarizeMatch;
    const summaries: Record<string, string> = {
      short: "This paper introduces the Transformer architecture based entirely on attention mechanisms, achieving SOTA on translation tasks.",
      medium: "This seminal paper introduces the Transformer, a model architecture relying solely on attention mechanisms without recurrence or convolution. Multi-head self-attention enables parallel processing across positions, achieving state-of-the-art on WMT translation benchmarks with significantly less training time.",
      long: "This landmark work introduces the Transformer architecture — a sequence-to-sequence model that entirely replaces recurrence and convolutions with attention mechanisms. The key innovation is multi-head self-attention, which allows the model to jointly attend to information from different representation subspaces at different positions. The architecture consists of stacked encoder and decoder layers with residual connections and layer normalization. Positional encodings using sine and cosine functions provide sequence order information. The model achieves 28.4 BLEU on WMT 2014 English-German translation, outperforming all prior models, while training faster due to full parallelization. This work fundamentally transformed NLP and spawned the GPT, BERT, and T5 families of models.",
    };
    const summary = summaries[body.length || "medium"];
    if (mockSources[vid]) {
      mockSources[vid] = mockSources[vid].map((s) =>
        s.id === sid ? { ...s, aiSummary: summary } : s
      );
      const updated = mockSources[vid].find((s) => s.id === sid);
      return ok(updated);
    }
    return fail("Source not found");
  }

  // Extract insights
  const insightsMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/extract-insights$/);
  if (insightsMatch && method === "POST") {
    const [, vid, sid] = insightsMatch;
    const mockInsights = {
      researchProblem: "Existing sequence transduction models rely on recurrent or convolutional architectures which are inherently sequential, limiting parallelization during training.",
      methodology: "Proposed the Transformer using stacked multi-head self-attention layers and position-wise feed-forward networks for both encoder and decoder, with residual connections and layer normalization.",
      keyFindings: [
        { finding: "Multi-head attention allows joint attention to different representation subspaces simultaneously.", significance: "High" as const },
        { finding: "Achieved 28.4 BLEU on WMT 2014 En-De, outperforming all prior ensembles.", significance: "High" as const },
        { finding: "Training required significantly less compute than RNN-based models.", significance: "Medium" as const },
        { finding: "Positional encodings generalize to sequences longer than those seen in training.", significance: "Low" as const },
      ],
      contributions: [
        "Introduced the Transformer architecture — now the dominant paradigm in NLP",
        "Demonstrated that recurrence is not necessary for strong sequence modeling",
        "Proposed multi-head attention as a general mechanism for cross-position reasoning",
      ],
      limitations: [
        "Quadratic memory and compute complexity with respect to sequence length",
        "Requires large datasets and significant compute to train effectively",
        "Fixed positional encodings may not optimally represent all positional relationships",
      ],
      futureWork: [
        "Extending Transformers to images, audio, and video modalities",
        "Reducing quadratic complexity for longer contexts",
        "Sparse and linear attention approximations",
      ],
      datasets: ["WMT 2014 English-German", "WMT 2014 English-French"],
    };
    if (mockSources[vid]) {
      mockSources[vid] = mockSources[vid].map((s) =>
        s.id === sid ? { ...s, aiInsights: mockInsights, aiProcessedAt: new Date().toISOString() } : s
      );
      const updated = mockSources[vid].find((s) => s.id === sid);
      return ok(updated);
    }
    return fail("Source not found");
  }

  // QA Ask
  const qaAskMatch = url.match(/^\/api\/vault\/([^\/]+)\/ask$/);
  if (qaAskMatch && method === "POST") {
    const q = (body.question || "").toLowerCase();
    let answer = "Based on the sources in this vault, ";
    if (q.includes("attention") || q.includes("transformer")) {
      answer += "the **Transformer architecture** introduces multi-head self-attention as the core mechanism. Each attention head computes scaled dot-product attention: $\\text{Attention}(Q,K,V) = \\text{softmax}(QK^T/\\sqrt{d_k})V$. The multi-head version runs $h$ parallel attention heads and concatenates their outputs, allowing the model to jointly attend to information from different representation subspaces.";
    } else if (q.includes("method") || q.includes("approach")) {
      answer += "the primary methodology is the use of **stacked self-attention and point-wise fully connected layers** for both encoder and decoder. Residual connections and layer normalization are applied after each sub-layer. The encoder maps input sequences to continuous representations, and the decoder generates output sequences auto-regressively.";
    } else if (q.includes("limit") || q.includes("caveat")) {
      answer += "the main limitations identified include: (1) **quadratic memory complexity** O(N² · d) with respect to sequence length, limiting scalability to very long sequences; (2) requirement for **large training datasets** and significant compute; and (3) fixed positional encodings that may not generalize optimally across all task types.";
    } else {
      answer += `I found relevant information across ${body.sourceIds?.length || "the"} source(s). The key finding is that attention mechanisms can fully replace recurrence in sequence modeling, enabling better parallelization and achieving state-of-the-art results on NLP benchmarks.`;
    }
    return ok({
      answer,
      sources: [
        { sourceId: "src-001", title: "Attention Is All You Need", similarity: 0.94 },
        { sourceId: "src-002", title: "BERT: Pre-training of Deep Bidirectional Transformers", similarity: 0.71 },
      ],
      chunksUsed: 12,
    });
  }

  // ── ANNOTATIONS ───────────────────────────────────────────────────────
  const annsListMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/annotation$/);
  if (annsListMatch) {
    const sid = annsListMatch[2];
    if (method === "GET") {
      return ok(mockAnnotations[sid] || []);
    }
    if (method === "POST") {
      const newAnn = {
        id: "ann-" + Date.now(),
        sourceId: sid,
        vaultId: annsListMatch[1],
        userId: mockUser.id,
        contentMarkdown: body.contentMarkdown || "",
        contentHtml: body.contentHtml || "",
        pageReference: body.pageReference || null,
        sectionReference: body.sectionReference || null,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { id: mockUser.id, name: mockUser.name, email: mockUser.email, avatar: mockUser.avatar },
      };
      if (!mockAnnotations[sid]) mockAnnotations[sid] = [];
      mockAnnotations[sid] = [newAnn, ...mockAnnotations[sid]];
      return ok(newAnn);
    }
  }

  const annDetailMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/annotation\/([^\/]+)$/);
  if (annDetailMatch) {
    const [, , sid, annId] = annDetailMatch;
    if (method === "PUT") {
      if (mockAnnotations[sid]) {
        mockAnnotations[sid] = mockAnnotations[sid].map((a) =>
          a.id === annId
            ? { ...a, ...body, version: (a.version || 1) + 1, updatedAt: new Date().toISOString() }
            : a
        );
        return ok(mockAnnotations[sid].find((a) => a.id === annId));
      }
    }
    if (method === "DELETE") {
      if (mockAnnotations[sid]) {
        mockAnnotations[sid] = mockAnnotations[sid].filter((a) => a.id !== annId);
      }
      return ok({ deleted: true });
    }
  }

  // Annotation enhance
  const enhanceMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/annotation\/enhance$/);
  if (enhanceMatch && method === "POST") {
    const enhanced = (body.draft || "") +
      "\n\n---\n*AI Enhancement: This annotation has been enriched with additional context, improved structure, and clarified technical terminology to aid collaborative research comprehension.*";
    return ok({ enhanced });
  }

  // Simulate conflict
  const conflictMatch = url.match(/^\/api\/vault\/([^\/]+)\/source\/([^\/]+)\/annotation\/([^\/]+)\/simulate-conflict$/);
  if (conflictMatch && method === "POST") {
    const colleagueDraft = (body.currentDraft || "") + "\n\n*Amendment by Prof. Adrian Carter: Additional cross-validation confirms the theoretical bounds hold under distributed training conditions. Empirical results align with the theoretical predictions across all benchmark datasets.*";
    const mergedContent = body.currentDraft + "\n\n**[Merged Revision — Prof. Adrian Carter]:** Additional cross-validation confirms the theoretical bounds hold under distributed training conditions.";
    return ok({
      resolved: true,
      userProposedDraft: body.currentDraft || "",
      colleagueDraft,
      mergedContent,
      details: "Concurrent edit detected. Prof. Adrian Carter saved a revision 2 seconds after your last keystroke.",
    });
  }

  // User search
  if (url.startsWith("/api/user/all")) {
    return ok({
      users: [
        { id: "mock-user-004", name: "Dr. Kenji Watanabe", email: "k.watanabe@tokyo.ac.jp", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji" },
        { id: "mock-user-005", name: "Priya Nair", email: "p.nair@iitb.ac.in", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya" },
      ],
    });
  }

  // User plan upgrade
  if (url === "/api/user/upgrade" && method === "POST") {
    const plan = body.plan || "FREE";
    const limits =
      plan === "PRO"
        ? { dailyLimit: 500, weeklyLimit: 3000 }
        : { dailyLimit: 10, weeklyLimit: 30 };
    mockUser = {
      ...mockUser,
      plan,
      aiUsage: {
        dailyUsed: mockUser.aiUsage?.dailyUsed ?? 0,
        weeklyUsed: mockUser.aiUsage?.weeklyUsed ?? 0,
        ...limits,
      },
    };
    return ok(mockUser);
  }

  // Default fallback
  return fail(`Mock: no handler for ${method} ${url}`);
}
