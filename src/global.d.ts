declare module '@squoosh/lib' {
  export class ImagePool {
    async close();
    ingestImage(path: string);
  }
}
