import { file as checksum } from 'checksum';

export async function generateChecksum(path: string) {
  return await new Promise<string>((resolve, reject) => {
    checksum(path, (error, hash) => {
      if (error) {
        reject(error);
      }
      resolve(hash);
    });
  });
}
