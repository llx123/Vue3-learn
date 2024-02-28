import { cpus } from "node:os";
import { execa } from "execa";
import { targets as allTargets } from "./utils.js";

run();

async function run() {
  console.log(allTargets);
  await buildAll(allTargets);
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
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit", // 执行时的标准输入、输出和错误流继承自父进程
  });
}
