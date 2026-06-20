import type { SkillSearchResult, SkillDetail, SkillAudit } from './types';

const SKILLS_API_BASE = 'https://skills.sh';

export interface SearchOptions {
  query: string;
  limit?: number;
}

export async function searchSkills({ query, limit = 20 }: SearchOptions): Promise<SkillSearchResult[]> {
  try {
    const url = `${SKILLS_API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as {
      skills: Array<{
        id: string;
        skillId: string;
        name: string;
        source: string;
        installs: number;
      }>;
    };
    return data.skills.map((s) => ({
      id: s.id,
      slug: s.skillId,
      name: s.name,
      source: s.source,
      installs: s.installs,
      sourceType: 'github',
      installUrl: `https://github.com/${s.source}`,
      url: `${SKILLS_API_BASE}/${s.id}`,
    }));
  } catch {
    return [];
  }
}

export async function getSkillDetail(source: string, skill: string): Promise<SkillDetail | null> {
  try {
    const url = `${SKILLS_API_BASE}/api/download/${source}/${skill}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as SkillDetail;
    return data;
  } catch {
    return null;
  }
}

export async function getSkillAudit(source: string, skill: string, token?: string): Promise<SkillAudit | null> {
  try {
    const url = `${SKILLS_API_BASE}/api/v1/skills/audit/${source}/${skill}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.json() as SkillAudit;
  } catch {
    return null;
  }
}

export async function fetchSkillContent(source: string, skill: string, filePath: string): Promise<string | null> {
  try {
    const detail = await getSkillDetail(source, skill);
    if (!detail?.files) return null;
    const file = detail.files.find((f) => f.path === filePath);
    return file?.contents ?? null;
  } catch {
    return null;
  }
}

export async function fetchSkillReadme(source: string, skill: string): Promise<string | null> {
  return fetchSkillContent(source, skill, 'SKILL.md');
}
