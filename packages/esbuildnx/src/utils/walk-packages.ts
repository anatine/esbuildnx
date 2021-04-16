import { readJson, readdir, existsSync, copy, emptyDir } from 'fs-extra';

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
  for (let i = 0; i < dirs.length - 1; i++) {
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

    for (let i = 0; i < allDeps.length - 1; i++) {
      const name = allDeps[i];
      const module = modules.get(name);
      if (module) {
        module.external = module.external || external;
        module.path = [...module.path, packagePath];
        modules.set(name, module);
      } else {
        modules.set(name, { external, top, path: [packagePath] });
      }

      if (existsSync(`${path}/${name}`)) {
        await processPackage(`${path}/${name}`, external);
      }
    }
  };

  for (let i = 0; i < dirs.length - 1; i++) {
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

  const final: any[] = [];
  modules.forEach((value, key) => {
    if (value.external && value.top) {
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

  await emptyDir(`${destPath}/node_modules`);

  for (let i = 0; i < modules.length - 1; i++) {
    const name = modules[i];
    await copy(
      `${projectRoot}/node_modules/${name}`,
      `${destPath}/node_modules/${name}`
    );
  }

  return modules;
}
