import { SquooshPluginOptions } from '../types';
import { join } from 'path';

export const DEFAULT_OPTIONS: SquooshPluginOptions = {
  dirs: [],
  outDir: join(process.cwd(), 'dist'),
  include: /\.(jpeg|jpg|png)$/,
  requestPrefix: undefined,
  uuidNamespace: 'bc707c24-ee40-4f77-816e-15f0c76a81de',
  encodeOptions: {
    mozjpeg: {
      quality: 75,
      baseline: false,
      arithmetic: false,
      progressive: true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 1,
      quant_table: 3,
      trellis_multipass: false,
      trellis_opt_zero: false,
      trellis_opt_table: false,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: 75,
    },
  },
  outputFormat: 'mozjpeg',
};
