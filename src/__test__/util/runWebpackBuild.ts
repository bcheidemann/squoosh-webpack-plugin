import webpack from 'webpack';

import { createWebpackConfig } from './createWebpackConfig';

export async function runWebpackBuild(dirname: string, config: webpack.Configuration = {}) {
  const _config = createWebpackConfig(dirname, config);
  return new Promise<webpack.Stats | undefined>((resolve, reject) => {
    webpack(_config, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    })
  });
}
