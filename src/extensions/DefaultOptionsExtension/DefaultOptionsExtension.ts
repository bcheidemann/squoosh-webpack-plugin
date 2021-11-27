import { resolve } from 'path';
import {
  InitializeOptions,
  Extension,
  HookContext,
} from '../../types/extensions';
import { DEFAULT_OPTIONS } from './default-options';

export class DefaultOptionsExtension implements Extension {
  public order: number = Number.MIN_SAFE_INTEGER; // Ensure this extension runs first

  public initialize(_: HookContext, baseOptions: InitializeOptions) {
    const options = {
      ...DEFAULT_OPTIONS,
      ...baseOptions,
    };

    // TODO: handle this internally
    options.outDir = resolve(
      process.cwd(),
      options.outDir,
    );

    return options;
  }
}
