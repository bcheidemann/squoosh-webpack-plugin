import { resolve } from 'path';
import { fork } from 'child_process';
import * as uuid from 'uuid';
import { DEFAULT_OPTIONS } from './options';
import { SquooshPluginOptions } from './types';
import { WorkerEvents } from './worker/events';
import {
  WorkerRequest,
  WorkerRequestData,
  WorkerResponse,
  WorkerResponseData,
} from './worker/types';

const workerPath = require.resolve('./worker');

const PLUGIN_NAME = 'squoosh-webpack-plugin';

export class SquooshPlugin {
  private workerProcess = fork(workerPath);
  private options: SquooshPluginOptions;

  constructor(options: Partial<SquooshPluginOptions> = {}) {
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
      this.workerProcess.send(request);
      this.workerProcess.on('message', (response: WorkerResponse<Event>) => {
        if (typeof response !== 'object') return;
        if (response.id === request.id) {
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
      });
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
            const request = {
              inputAssetPath: resolvedPath,
              outDir: this.options.outDir,
              encoding: this.options.encodeOptions,
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
