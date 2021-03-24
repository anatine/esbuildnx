import { inspect } from 'util';

export function printDiagnostics(...args) {
  console.log(inspect(args, false, 10, true));
}
