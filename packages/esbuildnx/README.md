# esbuildnx Plugin

The esbuild Plugin contains generators and executors for compiling a node app using [esbuild](https://esbuild.github.io/)

## Installing the esbuildnx Plugin

Installing the esbuildnx plugin to a workspace can be done with the following:

```shell
#yarn
yarn add -D @anatine/esbuildnx
```

```shell
#npm
npm install -D @anatine/esbuildnx
```

## Application Setup

This plugin is designed to be used with an existing Node application. Target an existing node app and run the setup.
```shell
nx generate @anatine/esbuildnx:setup <node-app>
```

If you want to replace the existing build command with esbuild, use the `--override` flag.
```shell
nx generate @anatine/esbuildnx:setup <node-app> --override 
```

## Commands

### esbuild

After a node project is setup, execute a build with the command:
```shell
nx esbuild <node-app>
```

#### esbuild options:  `external: [ ... ]`

Not every module can go through treeshaking and packing.
Esbuild provides an option called `external` that contains an array of package name strings.

This plugin will take all dependencies in the `package.json`, 
and merge them with any external files defined in the app `esbuild.json` file.
These node_modules will be copied into the dist directory at build time and will not be packed into the single .js file.

The entire compiled dist folder can be deployed into a docker container with minimum node_modules.

One of the goals of this plugin will be to grow and maintain a list of npm modules that can't be bundled by esbuild 
and automatically add them to the external file list.

#### watch
The `--watch` flag is also available. In watch mode, the `node_module` files are not copied over.
```shell
nx esbuild <node-app> --watch
```

### Overridden build

If the setup was run with the `--overritde` flag, build your node app as normal within the nx environment.
```shell
nx build <node-app>
```
