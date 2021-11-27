import { SquooshEncodeOptions, Codecs } from './encoder-options';
import { Extension } from './extensions';

export type SquooshPluginOptions<Codec extends Codecs = Codecs> = {
  // Internal Options
  extensions:
    | Array<Extension<Codec>>
    | ((defaultExtensions: Array<Extension>) => Array<Extension>);
  encoderOptions: SquooshEncodeOptions<Codec>;
  codec: Codec;
  useWorker: boolean;

  // Used by BaseResolverExtension
  requestPrefix?: string;
  include?: RegExp | Array<RegExp>;
  exclude?: RegExp | Array<RegExp>;
  dirs?: Array<string>;

  // Used by DefaultOutputPathExtension
  outDir?: string;
  uuidNamespace: string;
  preserveFileName?: boolean;
};
