import { resolve } from 'path';
import { fork } from 'child_process';
import * as uuid from 'uuid';
import { Codecs, SquooshPluginOptions } from './types';
import { WorkerEvents } from './worker/events';
import {
  WorkerRequest,
  WorkerRequestData,
  WorkerResponse,
  WorkerResponseData,
} from './worker/types';
import { Compiler } from 'webpack';
import { DEFAULT_EXTENSIONS } from './extensions/default.extensions';
import { sortLowHigh } from './utils/sort';
import { Extension, HookContext } from './types/extensions';
import { handlers } from './worker';

export * from './types';

const workerPath = require.resolve('./worker');

const PLUGIN_NAME = 'squoosh-webpack-plugin';

export class SquooshPlugin<Codec extends Codecs = 'mozjpeg'> {
  private workerProcess = fork(workerPath);
  private options: Promise<SquooshPluginOptions>;

  constructor(options?: Partial<SquooshPluginOptions<Codec>>) {
    this.options = this.validateOptions(options as SquooshPluginOptions);

    this.workerProcess = fork(workerPath);
    // TODO: default options plugins
  }

  async emitToWorker<Event extends WorkerEvents>(
    event: Event,
    data: WorkerRequestData<Event>
  ): Promise<WorkerResponseData<Event>> {
    const options = await this.options;
    if (options.useWorker) {
      return await new Promise<WorkerResponseData<Event>>((resolve, reject) => {
        const request: WorkerRequest<Event> = {
          event,
          data,
          id: uuid.v4(),
        };
        const handler = (response: WorkerResponse<Event>) => {
          if (typeof response !== 'object') return;
          if (response.id === request.id) {
            this.workerProcess.off('message', handler);
            if (response.event === request.event) {
              resolve(response.data);
            } else if (response.event === WorkerEvents.error) {
              reject(
                new Error(
                  [
                    `Error in image-optimise.worker.js.`,
                    `  Error occurred in event the handler for event: ${request.event}.`,
                    `  Handler responded with the error:`,
                    `    ${response.data}`,
                  ].join('\n')
                )
              );
            }
          }
        };
        this.workerProcess.send(request);
        this.workerProcess.on('message', handler);
      });
    }
    else {
      return await Promise.resolve(handlers[event](data));
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async (params) => {
      await this.emitToWorker(WorkerEvents.start, null);
    });
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.resolve.tapPromise(PLUGIN_NAME, async (resolveData) => {
        const options = await this.options;
        const resolvedPath = await this.resolveRequest(resolveData);
        if (resolvedPath) {
          const request: WorkerRequestData<WorkerEvents.process> = {
            inputAssetPath: resolvedPath,
            outDir: options.outDir,
            encoderOptions: options.encoderOptions,
            codec: options.codec,
            uuidNamespace: options.uuidNamespace,
          };
          const { outputAssetPath } = await this.emitToWorker(
            WorkerEvents.process,
            request
          );
          resolveData.request = outputAssetPath;
        }
      });
    });

    compiler.hooks.done.tapPromise(PLUGIN_NAME, async (stats) => {
      this.emitToWorker(WorkerEvents.stop, null);
    });
  }

  async resolveRequest(resolveData: any) {
    const options = await this.options;
    if (
      !options.requestPrefix ||
      resolveData.request.startsWith(options.requestPrefix)
    ) {
      const relativePath = options.requestPrefix
        ? resolveData.request.substr(options.requestPrefix.length)
        : resolveData.request;
      const absolutePath = resolve(resolveData.context, relativePath);
      if (!options.dirs || options.dirs.length === 0) {
        return absolutePath;
      } else if (
        options.dirs.some((dir) => {
          const searchDir = resolve(process.cwd(), dir);
          return absolutePath.startsWith(searchDir);
        })
      ) {
        return absolutePath;
      }
    }
    return null;
  }

  private async validateOptions(options?: Partial<SquooshPluginOptions>) {
    const baseOptions = {
      ...options,
    };

    if (baseOptions.extensions) {
      switch (typeof baseOptions.extensions) {
        case 'function':
          baseOptions.extensions = baseOptions.extensions(DEFAULT_EXTENSIONS);
          if (!Array.isArray(baseOptions.extensions)) {
            throw new Error(
              'Config Error: "extensions" must return an Array of Extensions.'
            );
          }
          break;
        case 'object':
          if (Array.isArray(baseOptions.extensions)) {
          }
        default:
          throw new Error(
            'Config Error: Type of "extensions" must be either Array or Function.'
          );
      }
    } else {
      baseOptions.extensions = DEFAULT_EXTENSIONS;
    }

    baseOptions.extensions = sortLowHigh(
      baseOptions.extensions,
      (extension) => extension.order || 0
    );

    return await this.applyInitializeExtensions(baseOptions);
  }

  private async applyInitializeExtensions(
    baseOptions: Partial<SquooshPluginOptions>
  ) {
    const extensions = baseOptions.extensions as Array<Extension>;
    let options = baseOptions;
    for (const extension of extensions) {
      if (extension.initialize) {
        const context = {
          options,
        } as HookContext;
        options = await Promise.resolve(extension.initialize(context, options));
      }
    }
    return options as SquooshPluginOptions;
  }
}
