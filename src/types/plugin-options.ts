import { SquooshEncodeOptions, Codecs } from './encoder-options';
import { Extension } from './extensions';

export type SquooshPluginOptions<Codec extends Codecs = Codecs> = {
  extensions:
    | Array<Extension<Codec>>
    | ((defaultExtensions: Array<Extension>) => Array<Extension>);
  dirs?: Array<string>;
  outDir: string;
  include?: RegExp | Array<RegExp>;
  exclude?: RegExp | Array<RegExp>;
  requestPrefix?: string;
  runInWorker: boolean;
  uuidNamespace: string;
  encoderOptions: SquooshEncodeOptions<Codec>;
  codec: Codec;
  useWorker: boolean;
};
