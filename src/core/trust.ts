import type { TrustScore, SecurityFinding, AuditEntry } from './types';

const INSTALL_THRESHOLDS = [
  { min: 100_000, score: 1.0 },
  { min: 50_000, score: 0.9 },
  { min: 10_000, score: 0.8 },
  { min: 5_000, score: 0.7 },
  { min: 1_000, score: 0.5 },
  { min: 100, score: 0.3 },
  { min: 0, score: 0.1 },
];

const STAR_THRESHOLDS = [
  { min: 10_000, score: 1.0 },
  { min: 5_000, score: 0.9 },
  { min: 1_000, score: 0.8 },
  { min: 500, score: 0.6 },
  { min: 100, score: 0.4 },
  { min: 0, score: 0.1 },
];

function scoreByThreshold(value: number, thresholds: { min: number; score: number }[]): number {
  for (const t of thresholds) {
    if (value >= t.min) return t.score;
  }
  return 0;
}

function scoreAudits(audits: AuditEntry[]): number {
  if (audits.length === 0) return 0.5;
  const worst = audits.reduce((w, a) => {
    const severity = a.status === 'fail' ? 3 : a.status === 'warn' ? 2 : 1;
    return Math.max(w, severity);
  }, 0);
  if (worst === 3) return 0.1;
  if (worst === 2) return 0.4;
  return 0.9;
}

function scoreSecurity(findings: SecurityFinding[]): number {
  if (findings.length === 0) return 1.0;
  const weights = { critical: 10, high: 5, medium: 2, low: 0.5 };
  let totalWeight = 0;
  for (const f of findings) {
    totalWeight += weights[f.severity] ?? 0;
  }
  const penalty = Math.min(totalWeight / 10, 1);
  return Math.max(0, 1 - penalty);
}

const WEIGHTS = {
  installs: 0.2,
  stars: 0.25,
  audits: 0.25,
  security: 0.3,
};

export function computeTrustScore(
  installs: number,
  stars: number,
  audits: AuditEntry[],
  findings: SecurityFinding[],
): TrustScore {
  const installScore = scoreByThreshold(installs, INSTALL_THRESHOLDS);
  const starScore = scoreByThreshold(stars, STAR_THRESHOLDS);
  const auditScore = scoreAudits(audits);
  const securityScore = scoreSecurity(findings);

  const weighted =
    installScore * WEIGHTS.installs +
    starScore * WEIGHTS.stars +
    auditScore * WEIGHTS.audits +
    securityScore * WEIGHTS.security;

  const score = Math.round(weighted * 100);

  let label: TrustScore['label'];
  if (score >= 80) label = 'excellent';
  else if (score >= 60) label = 'good';
  else if (score >= 40) label = 'moderate';
  else if (score >= 20) label = 'low';
  else label = 'poor';

  return {
    score,
    label,
    factors: {
      installs: { value: installs, score: installScore },
      stars: { value: stars, score: starScore },
      audits: { value: audits, score: auditScore },
      security: { value: findings, score: securityScore },
    },
  };
}

export function getGitHubRepoFromSource(source: string): { owner: string; repo: string } | null {
  const parts = source.split('/');
  if (parts.length >= 2) {
    return { owner: parts[0]!, repo: parts[1]! };
  }
  return null;
}

export async function fetchGitHubStars(owner: string, repo: string): Promise<number> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) return 0;
    const data = await res.json() as { stargazers_count?: number };
    return data.stargazers_count ?? 0;
  } catch {
    return 0;
  }
}
