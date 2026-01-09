import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

export interface FileUploadOptions {
  folder: string;
  maxSize?: number; // MB da
  allowedTypes?: string[];
}

export const createMulterConfig = (
  options: FileUploadOptions,
): MulterModuleOptions => {
  const {
    folder,
    maxSize = 5,
    allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  } = options;

  return {
    storage: diskStorage({
      destination: (_req: Request, _file: Express.Multer.File, cb) => {
        // Dynamic folder path yasaymiz
        const uploadPath = join(process.cwd(), 'uploads', folder);

        // Folder mavjud emas bo'lsa yaratamiz
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (_req: Request, file: Express.Multer.File, cb) => {
        // Unique filename yasaymiz
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
      },
    }),
    limits: {
      fileSize: maxSize * 1024 * 1024, // MB dan byte ga o'giramiz
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb) => {
      // File extension validation
      const fileExtension = extname(file.originalname)
        .toLowerCase()
        .substring(1);

      if (!allowedTypes.includes(fileExtension)) {
        cb(new BadRequestException('errors.invalid_file_format'), false);
        return;
      }

      // MIME type validation (qo'shimcha xavfsizlik uchun)
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new BadRequestException('errors.invalid_file_type'), false);
        return;
      }

      cb(null, true);
    },
  };
};

// Default configurations
export const defaultImageConfig: FileUploadOptions = {
  folder: 'images',
  maxSize: 5,
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

export const productImageConfig: FileUploadOptions = {
  folder: 'products',
  maxSize: 10,
  allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
};

export const categoryImageConfig: FileUploadOptions = {
  folder: 'categories',
  maxSize: 3,
  allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
};

export const userAvatarConfig: FileUploadOptions = {
  folder: 'avatars',
  maxSize: 2,
  allowedTypes: ['jpg', 'jpeg', 'png'],
};
