import { resolve } from 'path';
import { ChildProcess, fork } from 'child_process';
import * as uuid from 'uuid';
import { Codecs, SquooshPluginOptions } from './types';
import { WorkerEvents } from './worker/events';
import {
  WorkerRequest,
  WorkerRequestData,
  WorkerResponse,
  WorkerResponseData,
} from './worker/types';
import { Compiler as Compiler4, Plugin } from 'webpack4';
import { Compiler as Compiler5, WebpackPluginInstance } from 'webpack5';
import { DEFAULT_EXTENSIONS } from './extensions/default.extensions';
import { sortLowHigh } from './utils/sort';
import { Extension, HookContext, PrepareOptions, RequestOptions } from './types/extensions';
import { handlers } from './worker';
import { getWebpackVersion } from './utils/getWebpackVersion';
import { ResolveData } from './types/webpack';

export * from './types';

const workerPath = require.resolve('./worker');

const PLUGIN_NAME = 'squoosh-webpack-plugin';

export class SquooshPlugin<Codec extends Codecs = 'mozjpeg'> {
  private workerProcess: ChildProcess | null = null;
  private options: Promise<SquooshPluginOptions>;

  constructor(options?: Partial<SquooshPluginOptions<Codec>>) {
    this.options = this.validateOptions(options as SquooshPluginOptions);
  }

  private async emitToWorker<Event extends WorkerEvents>(
    event: Event,
    data: WorkerRequestData<Event>
  ): Promise<WorkerResponseData<Event>> {
    const options = await this.options;
    if (options.useWorker) {
      if (!this.workerProcess) {
        this.workerProcess = fork(workerPath);
      }
      const worker = this.workerProcess as ChildProcess;
      return await new Promise<WorkerResponseData<Event>>((resolve, reject) => {
        const request: WorkerRequest<Event> = {
          event,
          data,
          id: uuid.v4(),
        };
        const handler = (response: WorkerResponse<Event>) => {
          if (typeof response !== 'object') return;
          if (response.id === request.id) {
            worker.off('message', handler);
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
        worker.send(request);
        worker.on('message', handler);
      });
    }
    else {
      return await Promise.resolve(handlers[event](data));
    }
  }

  apply(compiler: any) {
    switch (getWebpackVersion(compiler)) {
      case 4:
        return this.webpack4Apply(compiler);
      case 5:
        return this.webpack5Apply(compiler);
    }
  }

  private webpack4Apply(compiler: Compiler4) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, this.handleBeforeCompile);

    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.beforeResolve.tapPromise(PLUGIN_NAME, this.handleResolve);
    });

    compiler.hooks.done.tapPromise(PLUGIN_NAME, this.handleStop);
  }

  private webpack5Apply(compiler: Compiler5) {
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, this.handleBeforeCompile);

    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.resolve.tapPromise(PLUGIN_NAME, this.handleResolve);
    });

    compiler.hooks.done.tapPromise(PLUGIN_NAME, this.handleStop);
  }

  private handleBeforeCompile = async () => {
    await this.emitToWorker(WorkerEvents.start, null);
  };

  private handleResolve = async (resolveData: ResolveData) => {
    const baseRequest: RequestOptions = {
      include: false, // Exclude by default
      context: resolveData.context,
      request: resolveData.request,
    };
    const requestData = await this.applyRequestHooks(baseRequest);

    if (requestData.include) {
      const options = await this.options;
      const inputPath = resolve(requestData.context, requestData.request);
      const processOptions: PrepareOptions = await this.applyPrepareHooks({
        skip: false, // No caching by default
        inputPath,
        outputPath: undefined,
        codec: options.codec,
        encoderOptions: options.encoderOptions,
      });

      if (!processOptions.outputPath) {
        throw new Error('At least one "prepare" hook must set the "outputPath".');
      }

      resolveData.request = processOptions.outputPath;

      if (!processOptions.skip) {
        const processRequest: WorkerRequestData<WorkerEvents.process> = {
          inputPath: processOptions.inputPath,
          outputPath: processOptions.outputPath,
          codec: processOptions.codec,
          encoderOptions: processOptions.encoderOptions,
        };
        await this.emitToWorker(
          WorkerEvents.process,
          processRequest,
        );
      }
    }
  };

  private handleStop =  async () => {
    await this.emitToWorker(WorkerEvents.stop, null);
    if (this.workerProcess) {
      this.workerProcess.kill();
    }
  };

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

    return await this.applyInitializeHooks(baseOptions);
  }

  private async applyInitializeHooks(
    baseOptions: Partial<SquooshPluginOptions>
  ) {
    const extensions = baseOptions.extensions as Array<Extension>;

    let options = baseOptions;
    for (const extension of extensions) {
      if (extension.initialize) {
        const context = Object.freeze({
          options,
        }) as HookContext;
        options = await Promise.resolve(extension.initialize(context, options));
      }
    }
    return options as SquooshPluginOptions;
  }

  private async applyRequestHooks(baseRequest: RequestOptions) {
    const options = await this.options;
    const context: HookContext = Object.freeze({
      options,
    });
    const extensions = options.extensions as Array<Extension>;

    let request = baseRequest;
    for (const extension of extensions) {
      if (extension.request) {
        request = await Promise.resolve(extension.request(context, request));
      }
    }

    return request;
  }

  private async applyPrepareHooks(baseOptions: PrepareOptions) {
    const options = await this.options;
    const context: HookContext = Object.freeze({
      options,
    });
    const extensions = options.extensions as Array<Extension>;

    let prepareOptions = baseOptions;
    for (const extension of extensions) {
      if (extension.prepare) {
        prepareOptions = await Promise.resolve(extension.prepare(context, prepareOptions));
      }
    }

    return prepareOptions;
  }
}
