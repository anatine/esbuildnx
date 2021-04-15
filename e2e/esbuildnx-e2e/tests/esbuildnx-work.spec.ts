import {
  ensureNxProject,
  runNxCommandAsync,
  runPackageManagerInstall,
  patchPackageJsonForPlugin,
  uniq,
} from '@nrwl/nx-plugin/testing';
import {} from '@nrwl/workspace';
import { inspect } from 'util';
import { execSync } from 'child_process';
import {
  readJsonSync,
  writeJSONSync,
  readFileSync,
  ensureSymlinkSync,
  ensureDirSync,
  removeSync,
} from 'fs-extra';

const peek = (message) => console.log(inspect(message, false, 10, true));

describe('WORKING', () => {
  const projectRoot = `${process.cwd()}/tmp/nx-e2e/proj`;
  const esbuildnxPluginModules = `${process.cwd()}/dist/packages/esbuildnx/node_modules`;
  const esbuildnxDecoratorsPlugin = `${process.cwd()}/dist/packages/esbuild-decorators`;

  beforeAll(() => {
    // ensureNxProject('@anatine/esbuildnx', 'dist/packages/esbuildnx');
    ensureDirSync(esbuildnxPluginModules);
    ensureSymlinkSync(
      esbuildnxDecoratorsPlugin,
      `${esbuildnxPluginModules}/@anatine/esbuild-decorators`
    );
  });

  afterAll(() => {
    // removeSync(esbuildnxPluginModules);
  });

  it('should create esbuildnx', async () => {
    const plugin = 'testing';
    // const plugin = uniq('esbuildnx');

    // expect(plugin).toBeDefined();
    // return;

    // await runNxCommandAsync(`generate @nrwl/node:application ${plugin}`);

    // Setup the node project
    await runNxCommandAsync(
      `generate @anatine/esbuildnx:setup ${plugin} --overwrite`
    );
    // Run the builder
    const result = await runNxCommandAsync(`build ${plugin} --skip-nx-cache`);

    if (result) {
      console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
    }

    expect(result.stdout).toContain('Build finished');

    const compiled = readFileSync(
      `${projectRoot}/dist/apps/${plugin}/main.js`,
      'utf8'
    );
    expect(compiled).toContain(`console.log("Hello World!");`);
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
