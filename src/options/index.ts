import { SquooshPluginOptions } from '../types';
import { join } from 'path';

export const DEFAULT_OPTIONS: SquooshPluginOptions = {
  dirs: [],
  outDir: join(process.cwd(), 'dist'),
  include: /\.(jpeg|jpg|png)$/,
  requestPrefix: undefined,
  uuidNamespace: 'bc707c24-ee40-4f77-816e-15f0c76a81de',
  encoderOptions: {},
  codec: 'mozjpeg',
};
