global.afterEach(() => {
  // Restore all mocks made with `jest.spyOn`.
  // Beware - this only works when the mock was created with jest.spyOn.
  // Thus you have to take care of restoration yourself when manually assigning jest.fn()
  jest.restoreAllMocks();
});



// Fix "Not enough memory" and
// related issues ("Cannot find module", "Too long with no output (exceeded 1m0s): context deadline exceeded")
// on CircleCI
// (taken from https://github.com/facebook/jest/issues/7874).
global.afterAll(() => {
  global.gc && global.gc();
});
