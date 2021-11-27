import { PrepareOptions, Extension, HookContext } from "../../types/extensions";
import { ExtensionError } from '../extension-error';
import { exists } from '../../utils/exists';

export class BasicCacheExtension implements Extension {
  public name = 'BasicCacheExtension';
  public order = Number.MAX_SAFE_INTEGER - 1; // Ensure this plugin after all other plugins except EnsureOutputDirectory;

  public async prepare(_: HookContext, options: PrepareOptions) {
    if (!options.outputPath) {
      throw new ExtensionError(this, 'Output path ("outputPath") must be defined by a preceding hook');
    }

    options.skip = await exists(options.outputPath);

    return options;
  }
}
