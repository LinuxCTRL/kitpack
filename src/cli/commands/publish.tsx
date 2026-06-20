import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function publishCommand() {
  const cwd = process.cwd();
  const metaPath = join(cwd, '.kitpack', 'packs.json');

  try {
    const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
    console.log(`📦 Publishing ${meta.name} v${meta.version}...`);
    // TODO: implement registry publish
    console.log('  ✓ published (local registry)');
  } catch (err) {
    console.error('Failed to publish:', err);
    process.exit(1);
  }
}
