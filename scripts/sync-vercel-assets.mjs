import { cp, copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'dist');
const destination = path.join(root, 'public');

await stat(source);
await mkdir(destination, { recursive: true });

const assetsDirectory = path.join(destination, 'assets');
await mkdir(assetsDirectory, { recursive: true });
for (const entry of await readdir(assetsDirectory, { withFileTypes: true })) {
  if (entry.isFile() && /^index-[\w-]+\.(?:css|js)$/.test(entry.name)) {
    await rm(path.join(assetsDirectory, entry.name));
  }
}

for (const entry of await readdir(source, { withFileTypes: true })) {
  const from = path.join(source, entry.name);
  const to = path.join(destination, entry.name);
  if (entry.isDirectory()) await cp(from, to, { recursive: true, force: true });
  else if (entry.isFile()) await copyFile(from, to);
}
console.info('Synchronized production SPA assets for Vercel static serving.');
