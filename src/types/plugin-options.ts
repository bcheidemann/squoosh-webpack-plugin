import { SquooshEncodeOptions, Codecs } from './encoder-options';

export type SquooshPluginOptions<Codec extends Codecs = Codecs> = {
  dirs: Array<string>;
  outDir: string;
  include: RegExp;
  requestPrefix?: string;
  uuidNamespace: string;
  encoderOptions: SquooshEncodeOptions<Codec>;
  codec: Codec;
};
