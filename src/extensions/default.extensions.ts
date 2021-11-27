import { Extension } from "../types/extensions";
import DefaultOptionsExtension from "./DefaultOptionsExtension";
import BaseResolverExtension from "./BaseResolverExtension";
import EnsureOutputDirectoryExtension from "./EnsureOutputDirectory";

export const DEFAULT_EXTENSIONS: Array<Extension<any>> = [
  new DefaultOptionsExtension(),
  new BaseResolverExtension(),
  new EnsureOutputDirectoryExtension(),
];
