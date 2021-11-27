import { dirname } from 'path';
import { ensureDir } from 'fs-extra';
import { PrepareOptions, Extension, HookContext } from "../../types/extensions";
import { ExtensionError } from '../extension-error';

export class EnsureOutputDirectoryExtension implements Extension {
  public name = 'EnsureOutputDirectoryExtension';
  public order = Number.MAX_SAFE_INTEGER; // Ensure this plugin runs last

  public async prepare(_: HookContext, options: PrepareOptions) {
    if (!options.outputPath) {
      throw new ExtensionError(this, 'Output path ("outputPath") must be defined by a preceding hook');
    }

    const outDir = dirname(options.outputPath);

    await ensureDir(outDir);

    return options;
  }
}
