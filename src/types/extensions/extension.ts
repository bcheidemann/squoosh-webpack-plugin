import { PrepareHook, RequestHook } from "./hooks";
import { Codecs } from "../encoder-options";
import { InitializeHook } from "./hooks";

export interface Extension<Codec extends Codecs = Codecs> {
  order?: number;
  initialize?: InitializeHook<Codec>;
  request?: RequestHook<Codec>;
  prepare?: PrepareHook<Codec>;
}
