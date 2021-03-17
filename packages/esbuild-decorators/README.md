# esbuild-decorators

## Overview

This is a plugin for [esbuild](https://esbuild.github.io/) to handle the tsconfig setting `"emitDecoratorMetadata": true,`

When the decorator flag is set to `true`, the build process will inspect each .ts file and upon a decorator, will transpile with Typescript.

## Usage

Install esbuild and the plugin

```shell
npm install -D esbuild
npm install -D @anatine/esbuild-decorators
```

Set up a build script

```typescript
import { build } from 'esbuild';
import { esbuildDecorators } from '@anatine/esbuild-decorators'

async function myBuilder(
  tsconfig: string,
  entryPoints: string[],
  outfile: string,
  cwd: string = process.cwd()
) {
  const buildResult = await build({
    platform: 'node',
    target: 'node14',
    bundle: true,
    sourcemap: 'external',
    plugins: [
      esbuildDecorators({
        tsconfig,
        cwd,
      }),
    ],
    tsconfig,
    entryPoints,
    outfile,
    external: [
      // This is likely to be your friend...
    ],
  });
}
```

Run your builder.

-----
### Options

|  Option  |  Description |
|  ------  |  ----------- |
| **tsconfig** | _optional_ : string : The path and filename of the tsconfig.json |
| **cwd** | _optional_ : string : The current working directory |
| **force** | _optional_ : boolean : Will transpile all `.ts` files to Javascript with tsc |
| **tsx** | _optional_ : boolean : Enable `.tsx` file support |


-----
### Caveats

There is no doubt that this will affect the performance of esbuild.
When emitDecoratorMetadata is set, every file will have to be loaded into this plugin.

This simple plugin hangs on the regex string: `/((?<![(\s]\s*['"])@\w*[\w\d]\s*(?![;])[((?=\s)])/`

Potentially esbuild could eventually do this regex search and expose positives via another plugin hook for transpiling.

Issue here: https://github.com/evanw/esbuild/issues/991


#### Credits

Thanks to [Thomas Schaaf](https://github.com/thomaschaaf) as this was his shared code that lead me here.
[Original Source]{https://github.com/thomaschaaf/esbuild-plugin-tsc}
