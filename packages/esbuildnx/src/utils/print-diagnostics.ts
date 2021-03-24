import { inspect } from 'util';
import { ensureDirSync } from 'fs-extra';
import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function printDiagnostics(...args) {
  console.log(inspect(args, false, 10, true));
}

export function exportDiagnostics(
  file: string,
  content: string | ((originalFileContent: string) => string)
): void {
  const targetFile = `${process.cwd()}/tmp/${file}`;
  console.log(`Saving output to ${targetFile}`);
  ensureDirSync(dirname(targetFile));
  if (typeof content === 'string') {
    writeFileSync(targetFile, content);
  } else {
    writeFileSync(targetFile, content(readFileSync(targetFile).toString()));
  }
}
