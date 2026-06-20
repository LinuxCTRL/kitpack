import { copyFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

export async function addCommand(files: string[]) {
  if (files.length === 0) {
    console.error('Usage: kitpack add <file> [file...]');
    process.exit(1);
  }

  const cwd = process.cwd();
  const packDir = join(cwd, '.kitpack', 'files');

  try {
    await mkdir(packDir, { recursive: true });

    for (const file of files) {
      const src = join(cwd, file);
      const dest = join(packDir, file);
      await mkdir(join(packDir, relative(cwd, join(cwd, file, '..'))), { recursive: true });
      await copyFile(src, dest);
      console.log(`  ✓ added ${file}`);
    }
  } catch (err) {
    console.error('Failed to add file:', err);
    process.exit(1);
  }
}
