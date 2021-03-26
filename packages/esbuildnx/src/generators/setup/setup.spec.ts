import { readJson, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { applicationGenerator } from '@nrwl/node';
import setupGenerator from './setup';

describe('Setup', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('Should add esbuild to project', async () => {
    const name = 'test-app-add';
    await applicationGenerator(tree, { name });
    await setupGenerator(tree, { name, overwrite: false });

    const project = readProjectConfiguration(tree, name);

    const esbuildConfig = readJson(tree, `${project.root}/esbuild.json`);

    expect(project.root).toEqual(`apps/${name}`);
    expect(project.targets.build.executor).toEqual('@nrwl/node:build');
    expect(project.targets.esbuild.executor).toEqual(
      '@anatine/esbuildnx:build'
    );
    expect(esbuildConfig.platform).toEqual('node');
  });

  it('Should replace esbuild as primary builder', async () => {
    const name = 'test-app-replace';
    await applicationGenerator(tree, { name });
    await setupGenerator(tree, { name, overwrite: true });

    const project = readProjectConfiguration(tree, name);

    const esbuildConfig = readJson(tree, `${project.root}/esbuild.json`);

    expect(project.root).toEqual(`apps/${name}`);
    expect(project.targets.build.executor).toEqual('@anatine/esbuildnx:build');
    expect(project.targets.esbuild).toBeUndefined();
    expect(esbuildConfig.platform).toEqual('node');
  });

  it('Should add in default @nrwl/nest externals', async () => {
    const name = 'test-app-nest';
    await applicationGenerator(tree, { name });
    await setupGenerator(tree, { name, defaultNestExternals: true });
    const project = readProjectConfiguration(tree, name);
    const esbuildConfig = readJson(tree, `${project.root}/esbuild.json`);
    expect(esbuildConfig.external).toEqual([
      '@nestjs/microservices',
      'class-transformer',
      'cache-manager',
      '@nestjs/websockets/socket-module',
      'class-validator',
      'class-transformer',
      '@nestjs/microservices/microservices-module',
      '@nestjs/microservices',
    ]);
  });
});
