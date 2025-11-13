import { definePackageConfig } from '../tsup.config.base';

export default definePackageConfig({
  entry: ['src/index.ts'],
  dts: {
    entry: ['src/index.ts'],
  },
  external: ['zod', 'x402'],
});

