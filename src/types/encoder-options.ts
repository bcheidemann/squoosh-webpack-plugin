import { AvifEncodeOptions } from '.';
import {
  JxlEncodeOptions,
  MozJPEGEncodeOptions,
  OxiPngEncodeOptions,
  WebPEncodeOptions,
  WP2EncodeOptions,
} from './squoosh';

export type Codecs = 'mozjpeg' | 'webp' | 'avif' | 'jxl' | 'wp2' | 'oxipng';

export type SquooshEncodeOptions<Codec extends Codecs = Codecs> =
  Codec extends 'mozjpeg'
    ? Partial<MozJPEGEncodeOptions>
    : Codec extends 'webp'
    ? Partial<WebPEncodeOptions>
    : Codec extends 'avif'
    ? Partial<AvifEncodeOptions>
    : Codec extends 'jxl'
    ? Partial<JxlEncodeOptions>
    : Codec extends 'wp2'
    ? Partial<WP2EncodeOptions>
    : Codec extends 'oxipng'
    ? Partial<OxiPngEncodeOptions>
    : never;
