module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //testRunner: 'jest-jasmine2', // See https://jestjs.io/blog/2021/05/25/jest-27
  testRegex: '.spec.ts$',
  collectCoverage: true,
  collectCoverageFrom: [ 'src/**/*.ts', '!**/*spec.ts', '!**/*specs.ts' ],
  coverageReporters: [
    'json', 'html', 'text'
  ],
  rootDir: '.',
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/global-hooks.ts'
  ],
  silent: true,
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};
