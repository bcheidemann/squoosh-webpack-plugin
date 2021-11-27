import { Codecs, SquooshEncodeOptions } from '../types';
import { WorkerEvents } from './events';

export type WorkerRequestDataTypes = {
  [WorkerEvents.error]: any;
  [WorkerEvents.start]: null;
  [WorkerEvents.stop]: null;
  [WorkerEvents.process]: {
    inputPath: string;
    outputPath: string;
    codec: Codecs;
    encoderOptions: SquooshEncodeOptions;
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
  [WorkerEvents.process]: null;
};

export type WorkerResponseData<Event extends WorkerEvents> =
  WorkerResponseDataTypes[Event];

export type WorkerResponse<Event extends WorkerEvents> = {
  event: Event;
  data: WorkerResponseData<Event>;
  id: string;
};
