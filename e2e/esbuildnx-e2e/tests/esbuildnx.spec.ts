import {
  ensureNxProject,
  runNxCommandAsync,
  runPackageManagerInstall,
  uniq,
} from '@nrwl/nx-plugin/testing';
import {} from '@nrwl/workspace';
import { inspect } from 'util';
import { execSync } from 'child_process';

const peek = (message) => console.log(inspect(message, false, 10, true));

describe('esbuildnx e2e', () => {
  it('should create esbuildnx', async (done) => {
    const cwd = `${process.cwd()}/tmp/nx-e2e/proj`;
    const plugin = 'in-progress';
    // const plugin = uniq('esbuildnx');

    // ensureNxProject('@anatine/esbuildnx', 'dist/packages/esbuildnx');
    //
    // await runNxCommandAsync(`generate @nrwl/nest:application ${plugin}`);

    const generate = await runNxCommandAsync(
      `generate @anatine/esbuildnx:setup ${plugin}`
    );
    console.log(generate.stdout);
    if (generate.stderr) console.error(generate.stderr);

    // console.log('runPackageManagerInstall ');
    // runPackageManagerInstall();

    // console.log(`Starting run command in: ${cwd}`);
    // const result = await runNxCommandAsync(
    //   `build ${plugin} --skip-nx-cache`
    // ).catch((err) => {
    //   console.warn(`An error was found in the build`);
    //   done(err);
    // });
    //
    // if (result) {
    //   console.log(result.stdout);
    //   if (result.stderr) console.error(result.stderr);
    // }

    // try {
    //   const result = execSync(`nx run ${plugin}:build --skip-nx-cache`, {
    //     cwd,
    //   });
    //   console.log(result);
    // } catch (err) {
    //   console.error(`Failed to run`);
    //   console.error(err);
    // }

    // expect(result.stdout).toContain('Executor ran');

    done();
  }, 150000);

  // describe('--directory', () => {
  //   it('should create src in the specified directory', async (done) => {
  //     const plugin = uniq('esbuildnx');
  //     ensureNxProject('@anatine/esbuildnx', 'dist/packages/esbuildnx');
  //     await runNxCommandAsync(
  //       `generate @anatine/esbuildnx:esbuildnx ${plugin} --directory subdir`
  //     );
  //     expect(() =>
  //       checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
  //     ).not.toThrow();
  //     done();
  //   });
  // });
  //
  // describe('--tags', () => {
  //   it('should add tags to nx.json', async (done) => {
  //     const plugin = uniq('esbuildnx');
  //     ensureNxProject('@anatine/esbuildnx', 'dist/packages/esbuildnx');
  //     await runNxCommandAsync(
  //       `generate @anatine/esbuildnx:esbuildnx ${plugin} --tags e2etag,e2ePackage`
  //     );
  //     const nxJson = readJson('nx.json');
  //     expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
  //     done();
  //   });
  // });
});
