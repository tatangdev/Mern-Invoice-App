import multer, { type StorageEngine } from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import type { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filename = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
): void => {
  const fileName = Date.now() + path.extname(file.originalname);
  callback(null, fileName);
};

const generateStorage = (destination: string): StorageEngine => {
  const backendRoot = path.join(__dirname, '..', '..');
  const uploadPath = path.join(backendRoot, destination);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, uploadPath);
    },
    filename: filename,
  });
};

const generateFileFilter = (mimetypes: string[]) => {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ): void => {
    if (mimetypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const err = new Error(
        `Only ${mimetypes.join(', ')} are allowed to upload!`,
      );
      callback(err);
    }
  };
};

export const imageStorage = multer({
  storage: generateStorage('uploads/images'),
  fileFilter: generateFileFilter(['image/png', 'image/jpg', 'image/jpeg']),
});
