import { copyPackages, getPackagesToCopy } from './walk-packages';
import { inspect } from 'util';
import { readdir } from 'fs-extra';

describe('Walk Packages', () => {
  test('google Logging oddness', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      '@google-cloud/logging-winston',
      // '@google-cloud/logging',
    ]);
    console.log(`Found total: ${result.length}`);
    console.log(inspect(result.sort(), false, 20, true));
    // expect(result.length).toEqual(27);
    expect(result).toBeDefined();
  });

  test('Can return a list of directories to copy', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      'ts-node',
      '@nrwl/jest',
      '@babel/core',
    ]);
    console.log(inspect(result, false, 20, true));
    expect(result.length).toEqual(71);
  });

  test('Can copy packages over as expected', async () => {
    const searchDir = process.cwd();
    const modules = await getPackagesToCopy(searchDir, [
      'ts-node',
      '@nrwl/jest',
      '@babel/core',
    ]);
    const result = await copyPackages(
      searchDir,
      `${process.cwd()}/tmp/copy-test`,
      modules
    );
    expect(result).toBeDefined();
    const check = await readdir(`${process.cwd()}/tmp/copy-test/node_modules`);
    expect(check.sort()).toEqual(
      [
        '@babel',
        '@jest',
        '@nrwl',
        '@types',
        'ansi-styles',
        'arg',
        'browserslist',
        'caniuse-lite',
        'chalk',
        'colorette',
        'convert-source-map',
        'create-require',
        'debug',
        'diff',
        'ejs',
        'electron-to-chromium',
        'enquirer',
        'escalade',
        'find-up',
        'fs-extra',
        'gensync',
        'globals',
        'graceful-fs',
        'ignore',
        'is-ci',
        'jest-pnp-resolver',
        'jest-resolve',
        'jest-util',
        'jsesc',
        'json5',
        'jsonfile',
        'locate-path',
        'lodash',
        'make-error',
        'minimist',
        'read-pkg',
        'read-pkg-up',
        'resolve',
        'rxjs',
        'semver',
        'source-map-support',
        'strip-json-comments',
        'tmp',
        'tslib',
        'yargs-parser',
      ].sort()
    );
  });
});
