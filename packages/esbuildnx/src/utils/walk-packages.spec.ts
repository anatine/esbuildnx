import { copyPackages, getPackagesToCopy } from './walk-packages';
import { inspect } from 'util';
import { readdir } from 'fs-extra';

describe('Walk Packages', () => {
  test('Can return a list of directories to copy', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      'ts-node',
      '@nrwl/jest',
      '@babel/core',
    ]);
    // console.log(inspect(result, false, 20, true));
    expect(result.length).toEqual(27);
  });

  test('Can return a list of directories to copy', async () => {
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
        '@nrwl',
        'arg',
        'convert-source-map',
        'create-require',
        'debug',
        'diff',
        'gensync',
        'jest-resolve',
        'json5',
        'lodash',
        'make-error',
        'rxjs',
        'semver',
        'source-map-support',
        'strip-json-comments',
      ].sort()
    );
  });
});
