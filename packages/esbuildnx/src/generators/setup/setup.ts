import {
  addDependenciesToPackageJson,
  formatFiles,
  readJson,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nrwl/devkit';
import { Schema } from './schema';
import { dependencies, devDependencies } from '../../dependencies';
import type { BuildOptions } from 'esbuild';

export async function setupGenerator(host: Tree, options: Schema) {
  const projectConfig = readProjectConfiguration(host, options.name); // Probably needs a try/catch

  const currentBuild = projectConfig?.targets?.build;

  if (
    !currentBuild ||
    (!currentBuild.options?.tsConfig && !currentBuild.options?.tsconfig)
  ) {
    throw new Error(
      `There is no existing build target or this is not not a @nrwl/node project`
    );
  }

  if (options.overwrite) {
    projectConfig.targets.build.executor = '@anatine/esbuildnx:build';
  } else {
    projectConfig.targets.esbuild = {
      ...currentBuild,
      executor: '@anatine/esbuildnx:build',
    };
  }

  const esbuildConfig: Partial<BuildOptions> = {
    platform: 'node',
    external: !options.defaultNestExternals
      ? []
      : [
          '@nestjs/microservices',
          'class-transformer',
          'cache-manager',
          '@nestjs/websockets/socket-module',
          'class-validator',
          'class-transformer',
          '@nestjs/microservices/microservices-module',
          '@nestjs/microservices',
        ],
  };

  try {
    readJson(host, `${projectConfig.root}/esbuild.json`);
    updateJson(host, `${projectConfig.root}/esbuild.json`, (value) => {
      value.platform = 'node';
      value.external = [...value.external, ...esbuildConfig.external];
      return value;
    });
  } catch (err) {
    writeJson(host, `${projectConfig.root}/esbuild.json`, esbuildConfig);
  }

  addDependenciesToPackageJson(host, dependencies, devDependencies);

  updateProjectConfiguration(host, options.name, projectConfig);

  await formatFiles(host);
}

export default setupGenerator;
