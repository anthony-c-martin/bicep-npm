import os from 'os';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function getUniqueTmpDir(name: string) {
  const basePath = path.join(os.tmpdir(), name);
  await mkdir(basePath, { recursive: true });

  return basePath;
}