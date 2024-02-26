import fs from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import { execa, execaSync } from "execa";
import { createRequire } from "node:module";
import { targets as allTargets } from "./utils.js";
const require = createRequire(import.meta.url);

run();

async function run() {
  console.log(allTargets);
  await buildAll(allTargets)
}
/**
 * 并行构建所有目标
 */
async function buildAll(targets) {
  await runParallel(cpus().length, targets, build);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  // 追踪当前正在执行的 Promise
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (maxConcurrency <= source.length) {
      const e = p.then(() => {
        executing.splice(executing.indexOf(e), 1);
      });
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(executing);
}

async function build(target) {
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`])
}
