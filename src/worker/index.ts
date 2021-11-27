import { ImagePool, encoders } from '@squoosh/lib';
import { writeFile } from 'fs-extra';
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
    inputPath,
    outputPath,
    codec,
    encoderOptions,
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

    // Encode the image
    const image = imagePool.ingestImage(inputPath);
    await image.decoded;
    await image.preprocess();
    await image.encode(squooshEncoderOptions);
    const { binary: rawEncodedImage } = await image.encodedWith[codec];

    // Save the file
    await writeFile(outputPath, rawEncodedImage);
    return null;
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
