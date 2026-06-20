import { getSkillDetail, getSkillAudit, searchSkills } from '../../core/api';
import { scanSkill, summarizeFindings } from '../../core/scanner';
import { computeTrustScore, getGitHubRepoFromSource, fetchGitHubStars } from '../../core/trust';
import { render } from 'ink';
import React from 'react';
import { SkillDetail } from '../ui/SkillDetail';
import type { InstallPreview } from '../../core/types';

function parseSkillRef(ref: string): { source: string; skill: string } | null {
  const parts = ref.split('/');
  if (parts.length === 3) {
    return { source: `${parts[0]}/${parts[1]}`, skill: parts[2]! };
  }
  if (parts.length === 2) {
    return { source: parts[0]!, skill: parts[1]! };
  }
  return null;
}

export async function installCommand(ref: string) {
  if (!ref) {
    console.error('Usage: kitpack install <owner/repo/skill> or <source/skill>');
    process.exit(1);
  }

  const parsed = parseSkillRef(ref);
  if (!parsed) {
    console.error(`Invalid skill reference: ${ref}. Use format: owner/repo/skill`);
    process.exit(1);
  }

  const { source, skill } = parsed;

  console.error(`Fetching skill details for ${source}/${skill}...`);

  const [detail, searchResults] = await Promise.all([
    getSkillDetail(source, skill),
    searchSkills({ query: skill, limit: 5 }),
  ]);

  if (!detail?.files) {
    console.error(`Skill not found: ${source}/${skill}`);
    process.exit(1);
  }

  const searchMatch = searchResults.find(
    (r) => r.source === source && r.slug === skill,
  );
  const installs = searchMatch?.installs ?? 0;

  const findings = scanSkill(detail.files);
  const summary = summarizeFindings(findings);

  const audit = await getSkillAudit(source, skill);

  const repoInfo = getGitHubRepoFromSource(source);
  const stars = repoInfo ? await fetchGitHubStars(repoInfo.owner, repoInfo.repo) : 0;

  const trust = computeTrustScore(installs, stars, audit?.audits ?? [], findings);

  const preview: InstallPreview = {
    skill: {
      id: `${source}/${skill}`,
      source,
      slug: skill,
      installs,
      hash: detail.hash ?? null,
      files: detail.files,
    },
    trust,
    findings,
    audit,
  };

  const { waitUntilExit } = render(<SkillDetail preview={preview} />);
  await waitUntilExit();

  const readmeFile = detail.files.find((f) => f.path === 'SKILL.md');
  const SKILL_MD = readmeFile?.contents;
  if (SKILL_MD) {
    console.log('\n--- SKILL.md Preview ---');
    console.log(SKILL_MD.slice(0, 2000));
    if (SKILL_MD.length > 2000) {
      console.log('... (truncated)');
    }
  }

  console.log(`\nSafety: ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, ${summary.low} low`);
  console.log(`Trust score: ${trust.score}/100 (${trust.label})`);
  console.log(`Installs: ${installs.toLocaleString()} | GitHub stars: ${stars}`);
  console.log(`\nTo install: npx skills add ${source} --skill ${skill}`);
}
