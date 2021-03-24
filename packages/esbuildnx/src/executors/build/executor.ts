import { BuildExecutorSchema } from './schema';

export async function esbuildExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}

export default esbuildExecutor;
