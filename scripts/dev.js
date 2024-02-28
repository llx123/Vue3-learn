import { execa } from "execa";

async function build(target) {
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit", // 执行时的标准输入、输出和错误流继承自父进程
  });
}

build('reactivity')