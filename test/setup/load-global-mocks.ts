// The idea is taken from https://github.com/facebook/jest/issues/335#issuecomment-499025217
// Without this jest forces you to explicitly load every global mock into your test suite,
// what is very inconvenient when you need some SUT dependencies to be mocked (a usual case)
// with a global mock - you don't want to explicitly do anything with such dependencies...

import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(__dirname, '../../app');
const globalMocksLocationRoot = path.resolve(__dirname, '../../test/__mocks__');

const isDirectory = (dir: string, file: string) =>
  fs.statSync(path.join(dir, file)).isDirectory();

const mockPathFor = (dir: string, file: string) => {
  return path.join(globalMocksLocationRoot, dir.replace(rootPath, ''), file);
};

const mockExists = (dir: string, file: string) => fs.existsSync(mockPathFor(dir, file));

const mockModule = (dir: string, file: string) => {
  const realModulePath = path.join(dir, file);
  const mockPath = mockPathFor(dir, file);
  console.log(`Mocking ${realModulePath} with ${mockPath}...`);
  jest.doMock(realModulePath, () => jest.requireActual(mockPath));
};

const initMocks = (dir: string) => {
  fs.readdirSync(dir)
    .forEach((file) => {
      if (isDirectory(dir, file)) {
        initMocks(path.join(dir, file));
      } else if (mockExists(dir, file)) {
        mockModule(dir, file);
      }
    });
};

// This will check all files below the specified directory.
console.log(`Looking for global __mocks__ for any files in ${rootPath}/**`);
initMocks(rootPath);
