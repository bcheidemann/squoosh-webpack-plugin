import { SquooshPluginOptions } from '../../types';

export const DEFAULT_OPTIONS: SquooshPluginOptions = {
  extensions: [
    // DEFAULT EXTENSIONS
  ],
  dirs: undefined,
  outDir: 'dist',
  include: /\.(jpeg|jpg|png)$/,
  exclude: undefined,
  requestPrefix: undefined,
  runInWorker: true,
  uuidNamespace: 'bc707c24-ee40-4f77-816e-15f0c76a81de',
  encoderOptions: {},
  codec: 'mozjpeg',
  useWorker: true,
};
