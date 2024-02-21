import fs from 'node:fs/promises'
import path from 'node:path'
import { execa, execaSync } from 'execa'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

console.log(import.meta.url, 233);
const list = await fs.readdir('packages');

list.map( async _ => {
  console.log((await fs.stat(`packages/${_}`)).isDirectory())
})

console.log('====================================');
console.log(list);
console.log('====================================');