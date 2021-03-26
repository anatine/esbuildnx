import {
  findConfigFile,
  parseConfigFileTextToJson,
  ParsedCommandLine,
  parseJsonConfigFileContent,
  sys,
} from 'typescript';
import { dirname } from 'path';
import { red } from 'chalk';

export function parseTsConfig(
  tsconfig,
  cwd = process.cwd()
): ParsedCommandLine {
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
      console.error(red(result.error));
      throw new Error(`failed to parse '${fileName}'`);
    }

    loadedConfig = result.config;
    baseDir = dirname(fileName);
  }

  const parsedTsConfig = parseJsonConfigFileContent(loadedConfig, sys, baseDir);

  if (parsedTsConfig.errors[0]) console.error(red(parsedTsConfig.errors));

  return parsedTsConfig;
}
