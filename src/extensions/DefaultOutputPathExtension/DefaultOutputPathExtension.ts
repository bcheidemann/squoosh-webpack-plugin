import { basename, dirname, join, resolve } from 'path';
import { PrepareOptions, Extension, HookContext } from '../../types/extensions';
import { v5 as uuidV5 } from 'uuid';
import { codecExtensionMap } from '../../utils/extensions';
import { generateChecksum } from '../../utils/checksum';
import { replaceExtension } from '../../utils/replaceExtension';
import { Tokens } from '../../tokens';

export class DefaultOutputPathExtension implements Extension {
  public name = 'DefaultOutputPathExtension';
  public order = Number.MAX_SAFE_INTEGER - 2; // Ensure this plugin after all other plugins except EnsureOutputDirectory and the BasicCacheExtension

  public async prepare(context: HookContext, options: PrepareOptions) {
    let outDir = context.options.outDir
      ? resolve(process.cwd(), context.options.outDir)
      : dirname(options.inputPath);
    outDir = outDir.replace(Tokens.ROOT_DIR, process.cwd());
    const inputFileName = basename(options.inputPath);
    
    if (context.options.preserveFileName) {
      const outputFilename = replaceExtension(inputFileName, codecExtensionMap[options.codec]);
      
      options.outputPath = join(
        outDir,
        outputFilename,
      );
    }
    else {
      const uuidNamespace = context.options.uuidNamespace;
      const serialisedEncoding = JSON.stringify(options.encoderOptions);
      const checksum = await generateChecksum(options.inputPath);
      const outputFileId = uuidV5(
        options.inputPath + serialisedEncoding + options.codec + checksum,
        uuidNamespace
      );
      const outputFilename = `${inputFileName}.${outputFileId}.${codecExtensionMap[options.codec]}`;

      options.outputPath = join(
        outDir,
        outputFilename,
      );
    }

    return options;
  }
}
