import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function initCommand() {
  const cwd = process.cwd();
  const packDir = join(cwd, '.kitpack');

  try {
    await mkdir(packDir, { recursive: true });
    const meta = {
      name: 'my-skill',
      version: '0.1.0',
      description: 'A new AI agent skill',
      tags: [],
    };
    await writeFile(join(packDir, 'packs.json'), JSON.stringify(meta, null, 2));
    console.log(`Initialised skill in ${packDir}`);
  } catch (err) {
    console.error('Failed to initialise skill:', err);
    process.exit(1);
  }
}
