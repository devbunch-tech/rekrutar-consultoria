import path from 'node:path';
import { Readable } from 'node:stream';
import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { env } from './env.js';

const ALLOWED = ['.pdf', '.doc', '.docx'];

const CONTENT_TYPE: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Bucket GridFS onde os currículos ficam — mesmo banco, nenhum serviço extra. */
export const BUCKET = 'curriculos';

function bucket(): mongoose.mongo.GridFSBucket {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB não conectado');
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });
}

/**
 * Currículos vão para o GridFS, não para o disco: os hosts gratuitos têm
 * filesystem efêmero e perderiam os arquivos a cada restart/redeploy.
 * A URL pública mantém o formato antigo (`/uploads/<id>`), então nada
 * do que já está salvo no banco muda de forma.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ALLOWED.includes(ext));
  },
});

export const uploadRouter: Router = Router();

uploadRouter.post('/api/upload/curriculo', upload.single('arquivo'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Envie um arquivo PDF, DOC ou DOCX de até 8 MB.' });
    return;
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  try {
    const stream = bucket().openUploadStream(req.file.originalname, {
      contentType: CONTENT_TYPE[ext] ?? 'application/octet-stream',
      metadata: { ext },
    });
    await new Promise<void>((resolve, reject) => {
      Readable.from(req.file!.buffer).pipe(stream).on('finish', resolve).on('error', reject);
    });

    res.json({
      url: `${env.publicApiUrl}/uploads/${stream.id.toString()}`,
      nome: req.file.originalname,
      tamanho: req.file.size,
    });
  } catch (err) {
    console.error('[upload] falha ao gravar currículo', err);
    res.status(500).json({ error: 'Não foi possível salvar o currículo.' });
  }
});

/** Download do currículo. Substitui o antigo express.static(UPLOAD_DIR). */
uploadRouter.get('/uploads/:id', async (req, res) => {
  let id: mongoose.Types.ObjectId;
  try {
    id = new mongoose.Types.ObjectId(req.params.id);
  } catch {
    res.status(404).send('Arquivo não encontrado');
    return;
  }

  try {
    const [file] = await bucket().find({ _id: id }).limit(1).toArray();
    if (!file) {
      res.status(404).send('Arquivo não encontrado');
      return;
    }

    res.setHeader('Content-Type', file.contentType ?? 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    );
    bucket()
      .openDownloadStream(id)
      .on('error', () => res.destroy())
      .pipe(res);
  } catch (err) {
    console.error('[upload] falha ao ler currículo', err);
    res.status(500).send('Erro ao ler o arquivo');
  }
});
