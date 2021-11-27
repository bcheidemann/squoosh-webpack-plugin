import { Extension } from "../types/extensions";

export class ExtensionError extends Error {
  constructor(extension: Extension, message: string) {
    super(`Error in ${extension.name || '[Anonymous Extension]'}: ${message}`);
    this.name = 'ExtensionError';
  }
}
