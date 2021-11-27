import { SquooshPluginOptions } from "../plugin-options";
import { Codecs, SquooshEncodeOptions } from "../encoder-options";

export interface InitializeOptions<Codec extends Codecs = Codecs> extends Partial<SquooshPluginOptions<Codec>> {}

export interface RequestOptions {
  include: boolean;
  context: string;
  request: string;  
}

export interface PrepareOptions<Codec extends Codecs = Codecs> {
  skip: boolean; // this can be used for caching
  inputPath: string;
  outputPath?: string;
  codec: Codec;
  encoderOptions: SquooshEncodeOptions<Codec>;
}

export interface HookContext<Codec extends Codecs = Codecs> {
  options: SquooshPluginOptions<Codec>;
}

export type Hook<C, T> = (context: C, request: T) => T | Promise<T>;

/**
 * Initialize Hook
 * 
 * This is invoked once upon instantiating the `SquooshPlugin` class.
 * It will receive the an options object of type `SquooshPluginOptions`.
 */
 export type InitializeHook<Codec extends Codecs = Codecs> = Hook<HookContext<Codec>, InitializeOptions<Codec>>;

/**
 * Request Hook
 * 
 * This is invoked for every request that is resolved by
 * Webpack. It will receive:
 *  - context (the directory the resource is being requested from)
 *  - request (usually the relative file path or a node module)
 *  - include (set this to true if the resource should be processed by Squoosh)
 */
export type RequestHook<Codec extends Codecs = Codecs> = Hook<HookContext<Codec>, RequestOptions>;

/**
 * Prepare Hook
 * 
 * This is invoked after the Request Hook. It will receive:
 */
export type PrepareHook<Codec extends Codecs = Codecs> = Hook<HookContext<Codec>, PrepareOptions<Codec>>;
