import { BuildExecutorSchema } from './schema';
import { exportDiagnostics } from '../../utils/print-diagnostics';
import { inspect } from 'util';
import { ExecutorContext } from '@nrwl/devkit';
import { normalizeBuildOptions } from '../../utils/normalize-options';
import { pathExists } from 'fs-extra';
import { readJsonFile } from '@nrwl/workspace';
import { build, InitializeOptions } from 'esbuild';
import { exec } from 'child_process';
import { esbuildDecorators } from '../../utils/esbuild-decorators';
import { red, redBright } from 'chalk';

export const OUT_FILENAME = 'index.js';

export type NodeBuildEvent = {
  success: boolean;
};

export async function esbuildExecutor(
  rawOptions: BuildExecutorSchema,
  context: ExecutorContext
): Promise<NodeBuildEvent> {
  let diag: any = {};

  const { sourceRoot, root } = context.workspace.projects[context.projectName];

  if (!sourceRoot) {
    throw new Error(`${context.projectName} does not have a sourceRoot.`);
  }

  if (!root) {
    throw new Error(`${context.projectName} does not have a root.`);
  }

  // Eventually, it would be great to expose more esbuild settings on command line.
  //  For now, the app root directory can utilize an esbuild.json file for build API settings
  //  https://esbuild.github.io/api/#build-api
  const esBuildExists = await pathExists(`${root}/esbuild.json`).catch(
    () => undefined
  );

  const esbuildConfig = esBuildExists
    ? readJsonFile<Partial<InitializeOptions>>(`${root}/esbuild.json`)
    : {};

  const options = normalizeBuildOptions(
    rawOptions,
    esbuildConfig,
    context.root,
    sourceRoot,
    root
  );

  const outfile = `${options.outputPath}/${OUT_FILENAME}`;

  const [tscResult, esbuildResult] = await Promise.all([
    runTsc(options.tsConfig),
    build({
      logLevel: 'silent',
      platform: 'node',
      bundle: options.bundle || true,
      sourcemap: 'external',
      plugins: [
        esbuildDecorators({
          cwd: options.root,
        }),
      ],
      tsconfig: options.tsConfig,
      entryPoints: [options.main],
      outfile,
      ...esbuildConfig,
    }),
  ]);

  diag = {
    ...diag,
    tscResult,
    esbuildResult,
    options,
    rawOptions,
    context,
  };

  exportDiagnostics(
    `ESBUILDNX_testing_output.js`,
    `const output = ${inspect(diag, false, 10, false)}`
  );

  if (tscResult?.error?.code) {
    console.error(redBright(`\nTypescript Error: ${tscResult.error.code}`));
    console.error(red(tscResult.stdout));
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

function runTsc(
  tsconfigPath: string
): Promise<{
  error: { message: string; code: number };
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const command = `tsc --project ${tsconfigPath} -noEmit`; // -noEmit so as to not save out data
    exec(command, (error, stdout, stderr) => {
      resolve({
        error: { message: error?.message, code: error?.code },
        stdout,
        stderr,
      });
    });
  });
}

export default esbuildExecutor;
