import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export function deleteFileByUrl(fileUrl?: string | null) {
  if (!fileUrl) return;

  const normalizedPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;

  const absolutePath = join(process.cwd(), normalizedPath);

  if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }
}
