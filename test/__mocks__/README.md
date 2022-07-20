# Use of global mocks

All files from `test/__mocks__` directory in this repository are **automatically and implicitly** (see `test/setup/load-global-mocks.ts`) used for absolutely all test suites. The behaviour mocked (actually "stubbed" rather than "mocked") for any module globally - implicitly **influences any test**.

It means the following:

1. Any global mock should provide a "neutral" behavior.

  > For exmaple,
  `test/__mocks__/domain/services/config-service/env-loader.ts` makes the `configService` not dependent on the actual environment variables, but be provided with fake config values which allow any irrelevant test to pass (that test is indifferent to the mocked value(s)).

2. Any test/suite must not rely on the globally mocked behavior. **For any test context which relies on the globally mocked module behavior the module must be unmocked an explicitly re-mocked with the behavior needed for that context.**
For example, in `app/domain/services/config-service/config-validation.spec.ts`:

```
// 'env-loader' module is globally mocked in the test environment - so to test its internals we need to unmock it
jest.unmock('./env-loader');

// Use a real env-loader module...
```

Alternatively to using a real (unmocked) module, like in the example above, you can re-mock the module - this time explicitly - with the behavior which tests below in the test suite rely on.

**THE RULE OF THUMB:
When you read a test suite - all that influences the functionality under the testing must be explicitly visible.**

For example, if you use `httpRequestFactory` function (which provides a correctly shaped HTTP request) in a test which checks the functionality depending on some specific request payload, instead of this:

```
const request = httpRequestFactory();
const result = await myHandler(request);
```

do the following:

```
const request = httpRequestFactory({
  body: {
    criticalField: 'The value which forces SUT to go along the expected way'
  }
});
const result = await myHandler(request);
```
