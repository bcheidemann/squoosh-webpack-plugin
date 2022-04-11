/// <reference path="../node_modules/webpack/types.d.ts" />
/// <reference path="../node_modules/@types/jest/index.d.ts" />

declare module '@squoosh/lib' {
  export class ImagePool {
    async close();
    ingestImage(path: string);
  }

  export const encoders: Record<
    string,
    {
      defaultEncoderOptions: any;
    }
  >;
}
