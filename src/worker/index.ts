import { ImagePool, encoders } from '@squoosh/lib';
import { join, basename } from 'path';
import { ensureDir, stat, writeFile } from 'fs-extra';
import * as uuid from 'uuid';
import { WorkerEvents } from './events';
import { WorkerRequest, WorkerRequestData, WorkerResponseData } from './types';
import { Codecs } from '../types';

type MaybePromise<T> = Promise<T> | T;
type WorkerEventHandler<Event extends WorkerEvents> = (
  data: WorkerRequestData<Event>
) => MaybePromise<WorkerResponseData<Event>>;
type WorkerEventHandlers = {
  [Event in WorkerEvents]: WorkerEventHandler<Event>;
};

const codecExtensionMap: Record<Codecs, string> = {
  mozjpeg: 'jpg',
  webp: 'webp',
  avif: 'avif',
  jxl: 'jxl',
  wp2: 'wp2',
  oxipng: 'png',
};

let imagePool: ImagePool | undefined;

export const handlers: WorkerEventHandlers = {
  [WorkerEvents.error]() {},
  [WorkerEvents.start]() {
    if (!imagePool) {
      imagePool = new ImagePool();
    }
    return null;
  },
  async [WorkerEvents.stop]() {
    if (imagePool) {
      await imagePool.close();
      imagePool = undefined;
    }
    return null;
  },
  async [WorkerEvents.process]({
    inputAssetPath,
    outDir,
    encoderOptions,
    codec,
    uuidNamespace,
  }) {
    // Ensure image pool was initialised
    if (!imagePool) {
      throw new Error('Image pool was not initialised.');
    }

    // Create squoosh encoder options object
    const squooshEncoderOptions = {
      [codec]: {
        ...encoders[codec].defaultEncoderOptions,
        ...encoderOptions,
      },
    };

    // Ensure output dir exists
    await ensureDir(outDir);

    // Generate the output file path
    const inputFileName = basename(inputAssetPath);
    const serialisedEncoding = JSON.stringify(squooshEncoderOptions);
    const outputFileId = uuid.v5(
      inputAssetPath + serialisedEncoding + codec,
      uuidNamespace
    );
    const outputAssetPath = join(
      outDir,
      `${inputFileName}.${outputFileId}.${codecExtensionMap[codec]}`
    );

    // Check if the output file path exists
    try {
      await stat(outputAssetPath);
      // If the output file exists then return it
      return {
        outputAssetPath,
      };
    } catch (err: any) {
      // Throw any other errors than file not found
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    // Encode the image
    const image = imagePool.ingestImage(inputAssetPath);
    await image.decoded;
    await image.preprocess();
    await image.encode(squooshEncoderOptions);
    const { binary: rawEncodedImage } = await image.encodedWith[codec];

    // Save the file
    await writeFile(outputAssetPath, rawEncodedImage);

    // return the output asset path
    return {
      outputAssetPath,
    };
  },
};

process.on(
  'message',
  <Event extends WorkerEvents>(request: WorkerRequest<Event>) => {
    if (typeof request !== 'object') return;
    const { event, data, id } = request;
    const handler = handlers[event];
    if (handler) {
      const responseOrPromise = handler(data);
      Promise.resolve(responseOrPromise)
        .then((response) => {
          process.send?.({
            event,
            data: response,
            id,
          });
        })
        .catch((err) => {
          process.send?.({
            event: 'error',
            data: err.message,
            id,
          });
          console.error(err);
        });
    } else {
      process.send?.({
        event: 'error',
        data: `Unhandled event in squoosh worker (${event}).`,
        id,
      });
    }
  }
);
