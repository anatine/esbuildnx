import {
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
import {
  ensureDirSync,
  ensureSymlinkSync,
  readFileSync,
  removeSync,
} from 'fs-extra';

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

    await runNxCommandAsync(`generate @nrwl/node:application ${plugin}`);

    // Setup the node project
    await runNxCommandAsync(
      `generate @anatine/esbuildnx:setup ${plugin} --overwrite`
    );
    // Run the builder
    const result = await runNxCommandAsync(`build ${plugin}`);

    expect(result.stdout).toContain('Build finished');

    const compiled = readFileSync(
      `${projectRoot}/dist/apps/${plugin}/main.js`,
      'utf8'
    );
    expect(compiled).toContain(`console.log("Hello World!");`);

    done();
  }, 150000);
});
