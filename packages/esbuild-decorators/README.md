# esbuild-decorators

![Testing/Build](https://github.com/anatine/esbuildnx/actions/workflows/esbuild-decorator.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/anatine/esbuildnx/badge.svg)](https://snyk.io/test/github/anatine/esbuildnx)
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

This simple plugin hangs on the regex string: `/((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/`

Potentially esbuild could eventually do this regex search and expose positives via another plugin hook for transpiling.

Issue here: https://github.com/evanw/esbuild/issues/991


-----
#### Decorator Match Testing

Check out the [test](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators/src/__tests__/mock-project/app/src) files
and submit any issues or PRs if you see a pattern that should be covered.

----
#### Credits

Thanks to [Thomas Schaaf](https://github.com/thomaschaaf) as this was his shared code that lead me here.
[Original Source](https://github.com/thomaschaaf/esbuild-plugin-tsc)

Thanks to the npm package [strip-comments](https://www.npmjs.com/package/strip-comments) 
that was stripped down to cover only typescript comments and string removals
