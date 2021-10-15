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
