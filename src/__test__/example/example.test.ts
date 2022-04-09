import webpack from 'webpack';
import { runWebpackBuild } from '../util/runWebpackBuild';

describe('example', () => {
  it('should run webpack', async () => {
    await runWebpackBuild(__dirname, {
      plugins: [
        // new SquooshPlugin(),
      ]
    });
  });
});
