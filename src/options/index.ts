import { SquooshPluginOptions } from '../types';

export const DEFAULT_OPTIONS: SquooshPluginOptions = {
  dirs: [],
  outDir: 'dist',
  include: /\.(jpeg|jpg|png)$/,
  requestPrefix: undefined,
  uuidNamespace: 'bc707c24-ee40-4f77-816e-15f0c76a81de',
  encoderOptions: {},
  codec: 'mozjpeg',
};
