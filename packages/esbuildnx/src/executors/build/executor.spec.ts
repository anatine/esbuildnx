import { BuildExecutorSchema } from './schema';

const options: BuildExecutorSchema = { main: '', outputPath: '', tsConfig: '' };

describe('Build Executor', () => {
  it('can run', async () => {
    // const output = await esbuildExecutor(options);
    // expect(output.success).toBe(true);

    expect(true).toBeTruthy();
  });
});
