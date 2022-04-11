import { file } from 'checksum';

export async function checksum(filename: string) {
  return new Promise<string>((resolve, reject) => {
    file(filename, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  })
}