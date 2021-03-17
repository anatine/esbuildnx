import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import {
  ParsedCommandLine,
  transpileModule,
  findConfigFile,
  sys,
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
} from 'typescript';
import * as stripComments from 'strip-comments';
import { inspect } from 'util';

export interface EsbuildPluginTscOptions {
  // If empty, uses tsconfig.json
  tsconfig?: string;
  // If empty, uses the current working directory
  cwd?: string;
  // If true, force compilation with tsc
  force?: boolean;
  // If true, enables tsx file support
  tsx?: boolean;
}

const theFinder = new RegExp(
  /((?<![(\s]\s*['"])@\w*[\w\d]\s*(?![;])[((?=\s)])/
);

const findDecorators = (fileContent) =>
  theFinder.test(stripComments(fileContent));

export const esbuildDecorators = (options: EsbuildPluginTscOptions = {}) => ({
  name: 'tsc',
  setup(build) {
    const cwd = options.cwd || process.cwd();
    const tsconfigPath = options.tsconfig ?? join(cwd, './tsconfig.json');
    const forceTsc = options.force ?? false;
    const tsx = options.tsx ?? true;

    let parsedTsConfig = null;

    build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
      if (!parsedTsConfig) {
        parsedTsConfig = parseTsConfig(tsconfigPath, cwd);
        if (parsedTsConfig.sourcemap) {
          parsedTsConfig.sourcemap = false;
          parsedTsConfig.inlineSources = true;
          parsedTsConfig.inlineSourceMap = true;
        }
      }

      // Just return if we don't need to search the file.
      if (
        !forceTsc &&
        (!parsedTsConfig ||
          !parsedTsConfig.options ||
          !parsedTsConfig.options.emitDecoratorMetadata)
      ) {
        return;
      }

      const ts = await readFile(args.path, 'utf8').catch((err) =>
        printDiagnostics({ file: args.path, err })
      );

      // Find the decorator and if there isn't one, return out
      const hasDecorator = findDecorators(ts);
      if (!ts || !hasDecorator) {
        return;
      }

      const program = transpileModule(ts, parsedTsConfig);
      return { contents: program.outputText };
    });
  },
});

function parseTsConfig(tsconfig, cwd = process.cwd()): ParsedCommandLine {
  const fileName = findConfigFile(cwd, sys.fileExists, tsconfig);

  // if the value was provided, but no file, fail hard
  if (tsconfig !== undefined && !fileName)
    throw new Error(`failed to open '${fileName}'`);

  let loadedConfig = {};
  let baseDir = cwd;
  if (fileName) {
    const text = sys.readFile(fileName);
    if (text === undefined) throw new Error(`failed to read '${fileName}'`);

    const result = parseConfigFileTextToJson(fileName, text);

    if (result.error !== undefined) {
      printDiagnostics(result.error);
      throw new Error(`failed to parse '${fileName}'`);
    }

    loadedConfig = result.config;
    baseDir = dirname(fileName);
  }

  const parsedTsConfig = parseJsonConfigFileContent(loadedConfig, sys, baseDir);

  if (parsedTsConfig.errors[0]) printDiagnostics(parsedTsConfig.errors);

  return parsedTsConfig;
}

function printDiagnostics(...args) {
  console.log(inspect(args, false, 10, true));
}
