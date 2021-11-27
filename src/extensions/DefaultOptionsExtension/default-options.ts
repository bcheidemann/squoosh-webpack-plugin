import { SquooshPluginOptions } from '../../types';

export const DEFAULT_OPTIONS: SquooshPluginOptions = {
  // Internal Options
  extensions: [],
  encoderOptions: {},
  codec: 'mozjpeg',
  useWorker: true,
  
  // Used by BaseResolverExtension
  requestPrefix: undefined,
  include: /\.(jpeg|jpg|png)$/,
  exclude: undefined,
  dirs: undefined,
  
  // Used by DefaultOutputPathExtension
  outDir: 'dist',
  uuidNamespace: 'bc707c24-ee40-4f77-816e-15f0c76a81de',
};
