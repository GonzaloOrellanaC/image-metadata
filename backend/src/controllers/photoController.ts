import { Request, Response } from 'express';
import { extractExif } from '../services/exifService';
import { sortMetadata } from '../utils/sortMetadata';

export async function getPhotoMetadata(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "photo".' });
    }

    const buffer = req.file.buffer;
    const raw = await extractExif(buffer);
    const ordered = sortMetadata(raw);
    return res.json({ metadata: ordered });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error extracting metadata', err);
    return res.status(500).json({ error: 'Failed to extract metadata', details: err?.message });
  }
}
