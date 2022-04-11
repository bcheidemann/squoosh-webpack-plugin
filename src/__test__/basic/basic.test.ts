import { readFile } from 'fs/promises';
import path from 'path';
import { DEFAULT_EXTENSIONS } from '../../extensions/default.extensions';
import { SquooshPlugin } from '../../index';
import { checksum } from '../util/checksum';
import { getDistDir } from '../util/getDistDir';
import { runWebpackBuild } from '../util/runWebpackBuild';

describe('Should run a webpack build with default options', () => {
  async function test(webpackVersion: 4 | 5) {
    const dist = getDistDir(__dirname, webpackVersion);

    await runWebpackBuild(
      webpackVersion,
      __dirname,
      {
        plugins: [
          new SquooshPlugin({
            preserveFileName: true, // Ensure output is consistent
            useWorker: false, // Not working with Jest
            outDir: dist,
          }),
        ],
      },
    );

    const expectedOutputFilePath = path.resolve(dist, 'logo.jpg');
    const outputFileChecksum = await checksum(expectedOutputFilePath);
    const mainJs = await readFile(path.resolve(dist, 'main.js'), 'utf-8');
    const stringifiedOutputFilePath = JSON.stringify(expectedOutputFilePath);

    expect(outputFileChecksum).toMatchSnapshot();
    expect(mainJs).toContain(stringifiedOutputFilePath);
    expect(mainJs.replace(stringifiedOutputFilePath, '"<LOGO>"')).toMatchSnapshot();
  }

  const webpackVersions: [4, 5] = [4, 5];

  it.each(webpackVersions)('Webpack v%p', test);
});
