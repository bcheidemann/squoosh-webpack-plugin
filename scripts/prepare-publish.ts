import { copySync, mkdirSync, removeSync } from 'fs-extra';
import { join } from 'path';
import { execSync } from 'child_process';

// Get directory paths
const pwd = process.cwd();
const npmd = join(pwd, 'npm');

// Run the build
execSync('npm run build');

// Delete all files in npm directory
removeSync(npmd);

// Create empty npm directory
mkdirSync(npmd);

// Copy files into npm directory
copySync(join(pwd, 'dist'), join(npmd, 'dist'), { recursive: true });
copySync(join(pwd, 'package.json'), join(npmd, 'package.json'));
copySync(join(pwd, 'README.md'), join(npmd, 'README.md'));
copySync(join(pwd, 'LICENSE'), join(npmd, 'LICENSE'));
