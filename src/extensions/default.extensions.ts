import { Extension } from "../types/extensions";
import DefaultOptionsExtension from "./DefaultOptionsExtension";
import BaseResolverExtension from "./BaseResolverExtension";
import DefaultOutputPathExtension from "./DefaultOutputPathExtension";
import EnsureOutputDirectoryExtension from "./EnsureOutputDirectory";

// These define the default behaviour of the SquooshWebpackPlugin
export const DEFAULT_EXTENSIONS: Array<Extension<any>> = [
  new DefaultOptionsExtension(),
  new BaseResolverExtension(),
  new DefaultOutputPathExtension(),
  new EnsureOutputDirectoryExtension(),
];
