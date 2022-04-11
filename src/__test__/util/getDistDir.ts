import path from "path";

export function getDistDir(dirname: string, webpackVersion: 4 | 5) {
  return path.resolve(dirname, 'dist', `v${webpackVersion}`);
}