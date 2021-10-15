import { resolve } from 'path';
import { fork } from 'child_process';
import * as uuid from 'uuid';
import { DEFAULT_OPTIONS } from './options';
import { Codecs, SquooshPluginOptions } from './types';
import { WorkerEvents } from './worker/events';
import {
  WorkerRequest,
  WorkerRequestData,
  WorkerResponse,
  WorkerResponseData,
} from './worker/types';

export * from './types';

const workerPath = require.resolve('./worker');

const PLUGIN_NAME = 'squoosh-webpack-plugin';

export default class SquooshPlugin<T extends Codecs = 'mozjpeg'> {
  private workerProcess = fork(workerPath);
  private options: SquooshPluginOptions;

  constructor(options: Partial<SquooshPluginOptions<T>> = {}) {
    this.workerProcess = fork(workerPath);
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.emitToWorker(WorkerEvents.stop, null);
  }

  async emitToWorker<Event extends WorkerEvents>(
    event: Event,
    data: WorkerRequestData<Event>
  ): Promise<WorkerResponseData<Event>> {
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

  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise(
      PLUGIN_NAME,
      async (params: any) => {
        await this.emitToWorker(WorkerEvents.start, null);
      }
    );
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory: any) => {
      factory.hooks.resolve.tapPromise(
        PLUGIN_NAME,
        async (resolveData: any) => {
          const resolvedPath = this.resolveRequest(resolveData);
          if (resolvedPath) {
            const request: WorkerRequestData<WorkerEvents.process> = {
              inputAssetPath: resolvedPath,
              outDir: this.options.outDir,
              encoderOptions: this.options.encoderOptions,
              codec: this.options.codec,
              uuidNamespace: this.options.uuidNamespace,
            };
            const { outputAssetPath } = await this.emitToWorker(
              WorkerEvents.process,
              request
            );
            resolveData.request = outputAssetPath;
          }
        }
      );
    });

    compiler.hooks.done.tapPromise(PLUGIN_NAME, async (stats: any) => {
      this.emitToWorker(WorkerEvents.stop, null);
    });
  }

  resolveRequest(resolveData: any) {
    if (
      !this.options.requestPrefix ||
      resolveData.request.startsWith(this.options.requestPrefix)
    ) {
      const relativePath = this.options.requestPrefix
        ? resolveData.request.substr(this.options.requestPrefix.length)
        : resolveData.request;
      const absolutePath = resolve(resolveData.context, relativePath);
      if (!this.options.dirs || this.options.dirs.length === 0) {
        return absolutePath;
      } else if (
        this.options.dirs.some((dir) => {
          const searchDir = resolve(process.cwd(), dir);
          return absolutePath.startsWith(searchDir);
        })
      ) {
        return absolutePath;
      }
    }
    return null;
  }
}
