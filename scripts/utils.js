import fs from "node:fs";

export const targets = fs.readdirSync("packages").filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false;
  }
  // todo pkg 判断
  return true;
});
