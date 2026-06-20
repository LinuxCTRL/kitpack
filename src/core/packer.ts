import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SkillDetail } from './types';

export async function installSkill(skill: SkillDetail): Promise<string> {
  const baseDir = join(process.cwd(), '.kitpack', 'skills', skill.slug);
  const filesDir = join(baseDir, 'files');

  await mkdir(filesDir, { recursive: true });

  const meta = {
    name: skill.slug,
    source: skill.source,
    installs: skill.installs,
    hash: skill.hash,
    installedAt: new Date().toISOString(),
  };

  await writeFile(join(baseDir, 'packs.json'), JSON.stringify(meta, null, 2));

  if (skill.files) {
    for (const file of skill.files) {
      const dir = join(filesDir, file.path.split('/').slice(0, -1).join('/'));
      if (dir !== filesDir) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(join(filesDir, file.path), file.contents);
    }
  }

  return baseDir;
}
