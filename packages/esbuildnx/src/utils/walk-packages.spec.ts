import { copyPackages, getPackagesToCopy } from './walk-packages';
import { inspect } from 'util';
import { readdir, remove } from 'fs-extra';

describe('Walk Packages', () => {
  beforeAll(async () => {
    await remove(`${process.cwd()}/tmp/copy-test`).then();
    return;
  });
  test('google Logging oddness', async () => {
    const searchDir = process.cwd();
    const result = await getPackagesToCopy(searchDir, [
      '@google-cloud/logging-winston',
      // '@google-cloud/logging',
    ]);
    // console.log(`Found total: ${result.length}`);
    // console.log(inspect(result.sort(), false, 20, true));
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
    expect(result.length).toBeGreaterThanOrEqual(20);
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

    const cleaned = check.filter(
      (p) => !result.find((item) => item.startsWith(`${p}/`))
    );

    // TODO Fix subdirectory comparisons
    expect(cleaned.sort()).toEqual(
      result.filter((p) => p.indexOf('/') === -1).sort()
    );
  });
});
