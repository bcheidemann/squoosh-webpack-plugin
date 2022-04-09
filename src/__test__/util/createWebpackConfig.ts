import webpack from 'webpack';
import path from 'path';

export const createWebpackConfig = (
  dirname: string,
  config: webpack.Configuration = {},
): webpack.Configuration => ({
  mode: 'production',
  ...config,
  entry: path.resolve(dirname, 'src', 'index.js'),
  output: {
    ...config.output,
    filename: 'main.js',
    path: path.resolve(dirname, 'dist'),
  },
});
