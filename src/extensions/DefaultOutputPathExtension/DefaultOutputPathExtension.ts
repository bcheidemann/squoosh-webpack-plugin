import { basename, join, resolve } from 'path';
import { PrepareOptions, Extension, HookContext } from "../../types/extensions";
import { v5 as uuidV5 } from 'uuid';
import { codecExtensionMap } from '../../utils/extensions';
import { generateChecksum } from '../../utils/checksum';

export class DefaultOutputPathExtension implements Extension {
  public name = 'DefaultOutputPathExtension';
  public order = Number.MAX_SAFE_INTEGER - 2; // Ensure this plugin after all other plugins except EnsureOutputDirectory and the BasicCacheExtension

  public async prepare(context: HookContext, options: PrepareOptions) {
    const outDir = resolve(
      process.cwd(),
      context.options.outDir,
    );
    const uuidNamespace = context.options.uuidNamespace;
    const inputFileName = basename(options.inputPath);
    const serialisedEncoding = JSON.stringify(options.encoderOptions);
    const checksum = await generateChecksum(options.inputPath);
    const outputFileId = uuidV5(
      options.inputPath + serialisedEncoding + options.codec + checksum,
      uuidNamespace
    );

    options.outputPath = join(
      outDir,
      `${inputFileName}.${outputFileId}.${codecExtensionMap[options.codec]}`
    );

    return options;
  }
}
