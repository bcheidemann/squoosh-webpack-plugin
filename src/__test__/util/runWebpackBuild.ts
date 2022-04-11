import webpack4 from 'webpack4';
import webpack5 from 'webpack5';

import { createWebpack4Config, createWebpack5Config } from './createWebpackConfig';
import { removeDistFolder } from './removeDistFolder';

export async function runWebpackBuild(webpackVersion: 4 | 5, dirname: string, config: webpack4.Configuration | webpack5.Configuration = {}) {
  await removeDistFolder(dirname, webpackVersion);

  switch (webpackVersion) {
    case 4:
      return runWebpack4Build(dirname, config as webpack4.Configuration);
    case 5:
      return runWebpack5Build(dirname, config as webpack5.Configuration);
    default:
      throw new Error(`Webpack v${webpackVersion} is not supported`);
  }
}

async function runWebpack4Build(dirname: string, config: webpack4.Configuration = {}) {
  const _config = createWebpack4Config(dirname, config);
  return new Promise<webpack4.Stats | undefined>((resolve, reject) => {
    webpack4(_config, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    })
  });
}

async function runWebpack5Build(dirname: string, config: webpack5.Configuration = {}) {
  const _config = createWebpack5Config(dirname, config);
  return new Promise<webpack5.Stats | undefined>((resolve, reject) => {
    webpack5(_config, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    })
  });
}
