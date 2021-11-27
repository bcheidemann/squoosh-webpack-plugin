import { dirname } from 'path';
import { ensureDir } from 'fs-extra';
import { PrepareOptions, Extension, HookContext } from "../../types/extensions";

export class EnsureOutputDirectoryExtension implements Extension {
  public order: number = Number.MAX_SAFE_INTEGER; // Ensure this plugin runs last

  public async prepare(_: HookContext, options: PrepareOptions) {
    const outDir = dirname(options.outputPath);

    await ensureDir(outDir);

    return options;
  }
}
