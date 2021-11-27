/// <reference path="../node_modules/webpack/types.d.ts" />

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
