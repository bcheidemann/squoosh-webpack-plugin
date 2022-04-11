import { Compiler as Compiler4 } from 'webpack4';
import { Compiler as Compiler5 } from 'webpack5';

export function getWebpackVersion(compiler: Compiler4 | Compiler5) {
  if (!compiler.hooks) {
    throw new Error(`[SquooshWebpackPlugin] Webpack version is not supported!`);
  }

  // Webpack v5+ implements compiler caching
  return 'cache' in compiler ? 5 : 4;
};