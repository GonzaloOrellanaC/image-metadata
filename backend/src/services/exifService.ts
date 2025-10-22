import ExifReader from 'exifreader';

export function extractExif(buffer: Buffer): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    try {
      const tags = ExifReader.load(buffer);
      const result: Record<string, any> = {};
      for (const [key, tag] of Object.entries(tags)) {
        result[key] = (tag as any).value;
      }
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
