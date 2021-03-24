import type { InitializeOptions } from 'esbuild';
import type { EsbuildDecoratorsOptions } from '@anatine/esbuild-decorators';

export interface BuildExecutorSchema {
  esbuild?: Partial<InitializeOptions>;
  decoratorOptions?: Partial<EsbuildDecoratorsOptions>;
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
}
