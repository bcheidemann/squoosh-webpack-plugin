import webpack4 from 'webpack4';
import webpack5 from 'webpack5';
import path from 'path';
import { getDistDir } from './getDistDir';

const createConfig = <T extends webpack4.Configuration | webpack5.Configuration>(webpackVersion: 4 | 5, dirname: string, config: T): T => ({
  mode: 'production',
  ...config,
  entry: path.resolve(dirname, 'src', 'index.js'),
  output: {
    ...config.output,
    filename: 'main.js',
    path: getDistDir(dirname, webpackVersion),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: require.resolve('./image-loader.js'),
      }
    ]
  }
})

export const createWebpack4Config = (
  dirname: string,
  config: webpack4.Configuration,
) => createConfig(4, dirname, config);

export const createWebpack5Config = (
  dirname: string,
  config: webpack5.Configuration,
) => createConfig(5, dirname, config);
