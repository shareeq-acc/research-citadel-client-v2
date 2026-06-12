export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  isEmailVerified: boolean;
  loginProvider: 'EMAIL' | 'GOOGLE';
  createdAt: string;
  updatedAt: string;
  plan?: 'FREE' | 'PRO';
  aiUsage?: {
    dailyUsed: number;
    dailyLimit: number;
    weeklyUsed: number;
    weeklyLimit: number;
  };
  hasNotifications?: boolean;
}

export type NotificationType =
  | 'INVITATION'
  | 'VAULT_ACTIVITY'
  | 'AI_COMPLETE'
  | 'SYSTEM'
  | 'SECURITY';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Vault {
  id: string;
  name: string;
  description: string | null;
  privacy: 'PRIVATE' | 'PUBLIC';
  ownerId: string;
  myRole?: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  createdAt: string;
  _count?: {
    members: number;
    files: number;
    sources: number;
  };
  owner?: {
    name: string;
    avatar: string | null;
  };
  members?: VaultMember[];
}

export interface VaultMember {
  id: string;
  role: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface Source {
  id: string;
  vaultId: string;
  title: string;
  authors: string[];
  publication: string | null;
  year: number | null;
  externalUrl: string | null;
  sourceType: 'PDF' | 'WEB_ARTICLE' | 'DATASET' | 'VIDEO' | 'BOOK' | 'OTHER';
  fileId: string | null;
  file: { fileName: string; fileUrl: string; fileSize: number } | null;
  extractedText: string | null;
  textExtractedAt: string | null;
  aiSummary: string | null;
  aiInsights: InsightsDto | null;
  aiProcessedAt: string | null;
  chunksProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsightsDto {
  researchProblem: string;
  methodology: string;
  keyFindings: Array<{ finding: string; significance: 'High' | 'Medium' | 'Low' }>;
  contributions: string[];
  limitations: string[];
  futureWork: string[];
  datasets: string[];
}

export interface Annotation {
  id: string;
  sourceId: string;
  vaultId: string;
  userId: string;
  contentMarkdown: string;
  contentHtml: string;
  pageReference: number | null;
  sectionReference: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  source?: {
    id: string;
    title: string;
    sourceType: string;
  };
}

export interface Citation {
  id: string;
  sourceId: string;
  vaultId: string;
  format: 'APA' | 'MLA' | 'CHICAGO' | 'HARVARD' | 'IEEE' | 'BIBTEX';
  citation: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  vaultId: string;
  userId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface ChatMessage {
  id: string;
  vaultId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  replyToId?: string;
  replyToText?: string;
  replyToUser?: string;
  readBy: string[];
}

export interface TypingStatus {
  vaultId: string;
  userId: string;
  userName: string;
  lastActive: string;
}
