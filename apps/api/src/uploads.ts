import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { env } from './env.js';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = ['.pdf', '.doc', '.docx'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ALLOWED.includes(ext));
  },
});

/**
 * Upload de currículo. GraphQL trafega só a URL resultante — o binário sobe por
 * multipart aqui. Em produção, trocar o diskStorage por S3/Cloudflare R2.
 */
export const uploadRouter: Router = Router();

uploadRouter.post('/api/upload/curriculo', upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Envie um arquivo PDF, DOC ou DOCX de até 8 MB.' });
    return;
  }
  res.json({
    url: `${env.publicApiUrl}/uploads/${req.file.filename}`,
    nome: req.file.originalname,
    tamanho: req.file.size,
  });
});
