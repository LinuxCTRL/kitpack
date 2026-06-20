export interface PackMeta {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  tags?: string[];
  entry?: string;
  dependencies?: Record<string, string>;
}

export interface PackFile {
  path: string;
  content: string;
}

export interface SkillPack {
  meta: PackMeta;
  files: PackFile[];
}

export interface PackIndexEntry {
  name: string;
  version: string;
  description: string;
  tags: string[];
  installs: number;
  updatedAt: string;
}

export interface PacksConfig {
  registry: 'npm' | 'local';
  localIndexDir: string;
}

export interface SkillSearchResult {
  id: string;
  slug: string;
  name: string;
  source: string;
  installs: number;
  sourceType: string;
  installUrl: string | null;
  url: string;
  isDuplicate?: boolean;
}

export interface SkillDetail {
  id: string;
  source: string;
  slug: string;
  installs: number;
  hash: string | null;
  files: { path: string; contents: string }[] | null;
}

export interface AuditEntry {
  provider: string;
  slug: string;
  status: 'pass' | 'warn' | 'fail';
  summary: string;
  auditedAt: string;
  riskLevel?: string;
  categories?: string[];
}

export interface SkillAudit {
  id: string;
  source: string;
  slug: string;
  audits: AuditEntry[];
}

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  rule: string;
  description: string;
  file: string;
  line?: number;
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  stars: number;
  description: string;
  topics: string[];
}

export interface TrustScore {
  score: number;
  label: 'poor' | 'low' | 'moderate' | 'good' | 'excellent';
  factors: {
    installs: { value: number; score: number };
    stars: { value: number; score: number };
    audits: { value: AuditEntry[]; score: number };
    security: { value: SecurityFinding[]; score: number };
  };
}

export interface InstallPreview {
  skill: SkillDetail;
  trust: TrustScore;
  findings: SecurityFinding[];
  audit: SkillAudit | null;
}
