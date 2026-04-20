import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

function ensureUploadDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export const postImageMulterOptions: MulterOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  storage: diskStorage({
    destination: (
      _req: unknown,
      _file: { originalname: string },
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const uploadPath = 'uploads/posts';
      ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (
      _req: unknown,
      file: { originalname: string },
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
