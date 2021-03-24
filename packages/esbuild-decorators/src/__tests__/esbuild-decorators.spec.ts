import { esbuildDecorators } from '../lib/esbuild-decorators';

describe(`plugin tests`, () => {
  const mockBuilder = (options) => {
    let _filter;
    let _fn;
    const onLoad = (filter, fn) => {
      _filter = filter;
      _fn = fn;
    };
    const initialOptions: { tsconfig?: string } = options;
    const simulate = async (args) => _fn(args);
    return { onLoad, simulate, initialOptions };
  };

  let mockService;

  beforeAll(() => {
    mockService = mockBuilder({
      tsconfig: `wrong/config/file/for/testing/just/to/make/sure/override/works`,
    });
    const plugin = esbuildDecorators({
      tsconfig: `${__dirname}/mock-project/app/tsconfig.app.json`,
    });
    plugin.setup(mockService);
  });

  test(`Can return undefined if no decorators are found`, async () => {
    const result = await mockService.simulate({
      path: `${__dirname}/mock-project/app/src/no-decorators.ts.test`,
    });

    expect(result).not.toBeDefined();
  });

  test(`Can return transpiled code if decorators are found`, async () => {
    const result = await mockService.simulate({
      path: `${__dirname}/mock-project/app/src/mixed-example.ts.test`, //mixed-example
    });
    expect(result).toBeDefined();
  });

  test(`Can transpile successfully on various test cases`, async () => {
    const TOTAL_TESTS = 10;

    const results = await Promise.all(
      [...new Array(TOTAL_TESTS - 1)].map((_, i) =>
        mockService.simulate({
          path: `${__dirname}/mock-project/app/src/copy-${i + 1}.ts.test`, //mixed-example
        })
      )
    );

    results.forEach((result) => {
      expect(result).toBeDefined();
    });
  });
});
