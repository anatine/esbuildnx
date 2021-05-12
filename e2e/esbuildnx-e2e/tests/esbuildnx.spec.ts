import {
  ensureNxProject,
  patchPackageJsonForPlugin,
  runNxCommandAsync,
  uniq,
  tmpProjPath,
} from '@nrwl/nx-plugin/testing';
import {
  ensureDirSync,
  ensureSymlinkSync,
  readFileSync,
  removeSync,
  writeJson,
  readJson,
  readdir,
} from 'fs-extra';
import { inspect } from 'util';

describe('esbuildnx e2e', () => {
  const projectRoot = `${process.cwd()}/tmp/nx-e2e/proj`;
  const esbuildnxPluginModules = `${process.cwd()}/dist/packages/esbuildnx/node_modules`;
  const esbuildnxDecoratorsPlugin = `${process.cwd()}/dist/packages/esbuild-decorators`;

  beforeAll(() => {
    ensureNxProject('@anatine/esbuildnx', 'dist/packages/esbuildnx');
    ensureDirSync(esbuildnxPluginModules);
    ensureSymlinkSync(
      esbuildnxDecoratorsPlugin,
      `${esbuildnxPluginModules}/@anatine/esbuild-decorators`
    );
  });

  afterAll(() => {
    removeSync(esbuildnxPluginModules);
  });

  it('should create esbuildnx', async (done) => {
    const plugin = uniq('esbuildnx');

    console.log(`Generating temp project`);
    await runNxCommandAsync(`generate @nrwl/node:application ${plugin}`);

    console.log(`Running esbuild setup on new project`);
    // Setup the node project
    await runNxCommandAsync(
      `generate @anatine/esbuildnx:setup ${plugin} --overwrite`
    );
    const esbuildFile = `${tmpProjPath()}/apps/${plugin}/esbuild.json`;
    const esbuildOptions = await readJson(esbuildFile);
    esbuildOptions.external = ['@nrwl/jest'];
    console.log(
      `Updating file: ${esbuildFile} with ${inspect(
        esbuildOptions,
        false,
        10,
        true
      )}`
    );
    await writeJson(esbuildFile, esbuildOptions);

    console.log(`Running esbuild build on new project`);
    // Run the builder
    const result = await runNxCommandAsync(`build ${plugin} --skip-nx-cache`);

    expect(result.stdout).toContain('Build finished');
    console.log(result.stdout);
    if (result.stderr) {
      console.error(result.stderr);
    }

    const compiled = readFileSync(
      `${projectRoot}/dist/apps/${plugin}/main.js`,
      'utf8'
    );
    expect(compiled).toContain(`console.log("Hello World!");`);

    const check = await readdir(
      `${projectRoot}/dist/apps/${plugin}/node_modules`
    );
    console.log(inspect(check, false, 10, true));
    // expect(check.sort()).toEqual(
    //   ['@nrwl', 'jest-resolve', 'rxjs', 'strip-json-comments'].sort()
    // );

    done();
  }, 150000);
});
