global.afterEach(() => {
  // Restore all mocks made with `jest.spyOn`.
  // Beware - this only works when the mock was created with jest.spyOn.
  // Thus you have to take care of restoration yourself when manually assigning jest.fn()
  jest.restoreAllMocks();
});
