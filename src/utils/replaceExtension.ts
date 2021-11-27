export function replaceExtension(filename: string, extension: string) {
  return `${filename.substr(0, filename.lastIndexOf("."))}.${extension}`;
}
