import { readJson, readdir, existsSync, ensureDir } from 'fs-extra';
import copy from 'recursive-copy';

export interface PackageJsonDeps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export async function getPackagesToCopy(
  rootDirectory: string,
  external: string[] = []
) {
  const modules = new Map<
    string,
    { external: boolean; top: boolean; path: string[] }
  >();
  const cwd = `${rootDirectory}/node_modules`;
  const dirs = (await readdir(cwd).catch((err) => console.error(err))) || [];

  // Break out the @ package directories as well
  for (let i = 0; i < dirs.length; i++) {
    const name = dirs[i];
    if (name.startsWith('@')) {
      const subDirs =
        (await readdir(`${cwd}/${name}`).catch((err) => console.error(err))) ||
        [];
      dirs.splice(i, 1, ...subDirs.map((dir) => `${name}/${dir}`));
      i += subDirs.length - 1;
    }
  }

  const processPackage = async (
    path: string,
    external = false,
    top = false
  ) => {
    const packagePath = `${path}/package.json`;
    if (!existsSync(packagePath)) return;
    const pkg: PackageJsonDeps =
      (await readJson(packagePath).catch((err) => console.error(err))) || {};

    const allDeps = Object.keys(
      Object.assign({}, pkg.dependencies || {}, pkg.optionalDependencies || {})
    );

    for (let i = 0; i < allDeps.length; i++) {
      const name = allDeps[i];
      const module = modules.get(name);

      let alreadyExternal = false;

      if (module) {
        alreadyExternal = module.external;
        module.external = alreadyExternal || external;
        module.path = [...module.path, packagePath];
        modules.set(name, module);
      } else {
        modules.set(name, { external, top, path: [packagePath] });
      }

      // Will only process a module in the package.json if it is at the top
      //  and there is no instance in a sub directory of node_modules
      //  Also, only runs if a package hasn't already been flagged for external but it should be
      const subModule = rootDirectory + '/node_modules/' + name;
      const embeddedModule = path + '/node_modules/' + name;
      if (
        !existsSync(embeddedModule) &&
        existsSync(subModule) &&
        !alreadyExternal &&
        external
      ) {
        await processPackage(`${subModule}`, external);
      }
    }
  };

  for (let i = 0; i < dirs.length; i++) {
    const item = dirs[i];
    const data = {
      external: Boolean(external.find((search) => search === item)),
      top: true,
      path: [],
    };
    const current = modules.get(item);
    if (current) {
      modules.set(item, {
        ...current,
        external: current.external || data.external,
        top: true,
      });
    } else {
      modules.set(item, data);
    }
    await processPackage(`${cwd}/${item}`, data.external);
  }

  const final: string[] = [];
  modules.forEach((value, key) => {
    if (value.external) {
      final.push(key);
    }
  });

  return final;
}

export async function copyPackages(
  projectRoot: string,
  destPath: string,
  modules: string[] = []
) {
  if (!existsSync(`${projectRoot}/node_modules`)) {
    console.error(`Missing Directory: Unable to copy ${projectRoot}`);
    return;
  }

  if (modules.length === 0) return modules;

  await ensureDir(`${destPath}/node_modules`);

  for (let i = 0; i < modules.length; i++) {
    const name = modules[i];
    await copy(
      `${projectRoot}/node_modules/${name}`,
      `${destPath}/node_modules/${name}`,
      { overwrite: true }
    );
  }

  return modules;
}
