import { remove } from 'fs-extra';
import { getDistDir } from './getDistDir';

export async function removeDistFolder(dirname: string, webpackVersion: 4 | 5) {
  const dist = getDistDir(dirname, webpackVersion);
  return new Promise<void>((resolve, reject) => {
    remove(dist, (err) => {
      if (err) reject(err);
      resolve();
    })
  });
}
