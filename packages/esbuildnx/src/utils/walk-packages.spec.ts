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

  // TODO This test needs to be more controlled rather than running against package.json
  test('Can return a list of directories to copy', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      'ts-node',
      '@nrwl/jest',
      '@babel/core',
    ]);
    // console.log(inspect(result, false, 20, true));
    expect(result.length).toEqual(113);
  });

  // TODO This test needs to be more controlled rather than running against package.json
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
        'ansi-colors',
        'ansi-styles',
        'arg',
        'async',
        'at-least-node',
        'balanced-match',
        'brace-expansion',
        'braces',
        'browserslist',
        'caniuse-lite',
        'chalk',
        'ci-info',
        'color-convert',
        'color-name',
        'colorette',
        'concat-map',
        'convert-source-map',
        'create-require',
        'debug',
        'diff',
        'ejs',
        'electron-to-chromium',
        'enquirer',
        'escalade',
        'filelist',
        'fill-range',
        'find-up',
        'fs-extra',
        'fs.realpath',
        'gensync',
        'glob',
        'globals',
        'graceful-fs',
        'has-flag',
        'ignore',
        'inflight',
        'inherits',
        'is-ci',
        'is-number',
        'jake',
        'jest-pnp-resolver',
        'jest-resolve',
        'jest-util',
        'jsesc',
        'json5',
        'jsonfile',
        'locate-path',
        'make-error',
        'micromatch',
        'minimatch',
        'minimist',
        'ms',
        'node-releases',
        'once',
        'p-limit',
        'p-locate',
        'path-exists',
        'path-is-absolute',
        'picomatch',
        'read-pkg',
        'read-pkg-up',
        'resolve',
        'rimraf',
        'rxjs',
        'rxjs-for-await',
        'safe-buffer',
        'semver',
        'slash',
        'source-map',
        'source-map-support',
        'strip-json-comments',
        'supports-color',
        'tmp',
        'to-fast-properties',
        'to-regex-range',
        'ts-node',
        'tslib',
        'type-fest',
        'universalify',
        'wrappy',
        'yargs-parser',
        'yn',
      ].sort()
    );
  });
});
