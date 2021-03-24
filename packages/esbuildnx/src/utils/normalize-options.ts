import { basename, dirname, relative, resolve } from 'path';
import { BuildExecutorSchema } from 'anatine/esbuildnx';
import type { InitializeOptions } from 'esbuild';
import { statSync } from 'fs';

export interface FileReplacement {
  replace: string;
  with: string;
}

export function normalizeBuildOptions<
  T extends BuildExecutorSchema,
  U extends InitializeOptions
>(
  options: T,
  esbuildOptions: U,
  root: string,
  sourceRoot: string,
  projectRoot: string
): T {
  return {
    ...options,
    root,
    sourceRoot,
    projectRoot,
    main: resolve(root, options.main),
    outputPath: resolve(root, options.outputPath),
    tsConfig: resolve(root, options.tsConfig),
    esbuild: {
      bundle: options.bundle,
      watch: options.watch,
      ...options.esbuild,
      ...esbuildOptions,
    },
    fileReplacements: options.fileReplacements
      ? normalizeFileReplacements(root, options.fileReplacements)
      : [],
    assets: options.assets
      ? normalizeAssets(options.assets, root, sourceRoot)
      : [],
  };
}

function normalizeFileReplacements(
  root: string,
  fileReplacements: FileReplacement[]
): FileReplacement[] {
  return fileReplacements.map((fileReplacement) => ({
    replace: resolve(root, fileReplacement.replace),
    with: resolve(root, fileReplacement.with),
  }));
}

function normalizeAssets(
  assets: any[],
  root: string,
  sourceRoot: string
): any[] {
  return assets.map((asset) => {
    if (typeof asset === 'string') {
      const resolvedAssetPath = resolve(root, asset);
      const resolvedSourceRoot = resolve(root, sourceRoot);

      if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
        throw new Error(
          `The ${resolvedAssetPath} asset path must start with the project source root: ${sourceRoot}`
        );
      }

      const isDirectory = statSync(resolvedAssetPath).isDirectory();
      const input = isDirectory
        ? resolvedAssetPath
        : dirname(resolvedAssetPath);
      const output = relative(resolvedSourceRoot, resolve(root, input));
      const glob = isDirectory ? '**/*' : basename(resolvedAssetPath);
      return {
        input,
        output,
        glob,
      };
    } else {
      if (asset.output.startsWith('..')) {
        throw new Error(
          'An asset cannot be written to a location outside of the output path.'
        );
      }

      const resolvedAssetPath = resolve(root, asset.input);
      return {
        ...asset,
        input: resolvedAssetPath,
        // Now we remove starting slash to make Webpack place it from the output root.
        output: asset.output.replace(/^\//, ''),
      };
    }
  });
}
