export type OutputFormat = 'mozjpeg' | 'test';

export type SquooshEncodeOptions = Partial<
  Record<OutputFormat, Record<string, any>>
>;

export type SquooshPluginOptions = {
  dirs: Array<string>;
  outDir: string;
  include: RegExp;
  requestPrefix?: string;
  uuidNamespace: string;
  encodeOptions: SquooshEncodeOptions;
  outputFormat: OutputFormat; // TODO: add support for more output formats
};
