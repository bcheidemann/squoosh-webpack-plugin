import { ImagePool } from '@squoosh/lib';
import { join, basename } from 'path';
import { ensureDir, stat, writeFile } from 'fs-extra';
import * as uuid from 'uuid';
import { WorkerEvents } from './events';
import { WorkerRequest, WorkerRequestData, WorkerResponseData } from './types';

type MaybePromise<T> = Promise<T> | T;
type WorkerEventHandler<Event extends WorkerEvents> = (
  data: WorkerRequestData<Event>
) => MaybePromise<WorkerResponseData<Event>>;
type WorkerEventHandlers = {
  [Event in WorkerEvents]: WorkerEventHandler<Event>;
};

let imagePool: ImagePool | undefined;

const handlers: WorkerEventHandlers = {
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
    encoding,
    uuidNamespace,
  }) {
    // Ensure image pool was initialised
    if (!imagePool) {
      throw new Error('Image pool was not initialised.');
    }

    // Ensure output dir exists
    await ensureDir(outDir);

    // Generate the output file path
    const inputFileName = basename(inputAssetPath);
    const serialisedEncoding = JSON.stringify(encoding);
    const outputFileId = uuid.v5(
      inputAssetPath + serialisedEncoding,
      uuidNamespace
    );
    const outputAssetPath = join(
      outDir,
      `${inputFileName}.${outputFileId}.jpeg`
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
    await image.encode(encoding);
    const { binary: rawEncodedImage } = await image.encodedWith.mozjpeg;

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
      console.warn(`Unhandled event squoosh worker (${event}).`);
    }
  }
);
