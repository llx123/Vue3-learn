import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import esbuild from "rollup-plugin-esbuild";
import resolvePlugin from "@rollup/plugin-node-resolve";

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// 获取打包文件路径
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const resolve = (p) => path.resolve(packageDir, p);

const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.filename || path.basename(packageDir);

const outputConfigs = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  "esm-browser": {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

const packageFormats = packageOptions.formats || [];
const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfigs[format])
);

function createConfig(format, output) {
  if (!output) {
    process.exit(1);
  }
  output.name = packageOptions.name;
  output.sourcemap = true;

  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      alias({
        entries: {
          "@vue/shared": path.resolve(__dirname, "packages/shared/src/index.ts"),
        },
      }),
      json({
        namedExports: false,
      }),
      esbuild({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        sourceMap: output.sourcemap,
      }),
      resolvePlugin(),
    ],
  };
}

export default packageConfigs;
