import type { InitializeOptions } from 'esbuild';
import { FileReplacement } from '../../utils/normalize-options';
// import type { EsbuildDecoratorsOptions } from '@anatine/esbuild-decorators';

export interface BuildExecutorSchema {
  esbuild?: Partial<InitializeOptions>;
  decoratorOptions?: Partial<any>;
  skipTypeCheck?: boolean;
  tsx?: boolean;
  //
  main: string;
  outputPath: string;
  tsConfig: string;
  watch?: boolean;
  bundle?: boolean;
  // Webpack is for typechecking
  webpackConfig?: string;

  root?: string;
  sourceRoot?: string;
  projectRoot?: string;

  buildLibsFromSource?: boolean;

  fileReplacements: FileReplacement[];
  assets?: any[];

  externalDependencies: 'all' | 'none' | string[];
}
