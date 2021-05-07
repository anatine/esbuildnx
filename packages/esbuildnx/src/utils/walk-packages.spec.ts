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

  test('dd-trace oddness', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      'dd-trace',
      'form-data',
      // '@google-cloud/logging',
    ]);
    console.log(`Found total: ${result.length}`);
    console.log(inspect(result.sort(), false, 20, true));
    // expect(result.length).toEqual(27);
    expect(result).toBeDefined();
    expect(result).toContain('form-data');
    expect(result).toContain('combined-stream');
    expect(result).toContain('delayed-stream');
  });

  test('Can return a list of directories to copy', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      'ts-node',
      '@nrwl/jest',
      '@babel/core',
    ]);
    console.log(inspect(result, false, 20, true));
    expect(result.length).toEqual(104);
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
        'ansi-colors',
        'ansi-styles',
        'arg',
        'async',
        'balanced-match',
        'brace-expansion',
        'braces',
        'browserslist',
        'buffer-from',
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
        'gensync',
        'globals',
        'graceful-fs',
        'has-flag',
        'ignore',
        'is-ci',
        'is-core-module',
        'is-number',
        'jake',
        'jest-pnp-resolver',
        'jest-resolve',
        'jest-util',
        'jsesc',
        'json5',
        'locate-path',
        'lodash',
        'make-error',
        'micromatch',
        'minimatch',
        'minimist',
        'ms',
        'node-releases',
        'os-tmpdir',
        'p-limit',
        'p-locate',
        'path-exists',
        'picomatch',
        'read-pkg',
        'read-pkg-up',
        'resolve',
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
        'yargs-parser',
        'yn',
      ].sort()
    );
  });
});
