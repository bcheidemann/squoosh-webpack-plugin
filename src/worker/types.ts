import { SquooshEncodeOptions } from '../types';
import { WorkerEvents } from './events';

export type WorkerRequestDataTypes = {
  [WorkerEvents.error]: any;
  [WorkerEvents.start]: null;
  [WorkerEvents.stop]: null;
  [WorkerEvents.process]: {
    inputAssetPath: string;
    outDir: string;
    encoding: SquooshEncodeOptions;
    uuidNamespace: string;
  };
};

export type WorkerRequestData<Event extends WorkerEvents> =
  WorkerRequestDataTypes[Event];

export type WorkerRequest<Event extends WorkerEvents> = {
  event: Event;
  data: WorkerRequestData<Event>;
  id: string;
};

export type WorkerResponseDataTypes = {
  [WorkerEvents.error]: any;
  [WorkerEvents.start]: null;
  [WorkerEvents.stop]: null;
  [WorkerEvents.process]: {
    outputAssetPath: string;
  };
};

export type WorkerResponseData<Event extends WorkerEvents> =
  WorkerResponseDataTypes[Event];

export type WorkerResponse<Event extends WorkerEvents> = {
  event: Event;
  data: WorkerResponseData<Event>;
  id: string;
};
