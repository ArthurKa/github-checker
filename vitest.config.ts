import { defineConfig } from 'vitest/config';
import { workspaces } from './package.json';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: workspaces.map(e => `${e}/src/**/*.unit.test.ts`),
        },
      },
      {
        test: {
          name: 'int',
          include: workspaces.map(e => `${e}/src/**/*.int.test.ts`),
          testTimeout: 20000,
        },
      },
    ],
  },
});
