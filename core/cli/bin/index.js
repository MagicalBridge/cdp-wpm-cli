#! /usr/bin/env node 

const importLocal = require("import-local")

if(importLocal(__filename)) {
  require("npmlog").info("cdp-cli","正在使用 cdp-cli 本地安装版本")
} else {
  // 如果本地没有安装 cdp-wpm 这个脚手架，我们认为走的是调试模式
  // console.log(process.argv.slice());
  // [
  //   '/Users/louis/.nvm/versions/node/v16.14.2/bin/node',
  //   '/Users/louis/.nvm/versions/node/v16.14.2/bin/cdp-wpm'
  // ]
  require("../lib")(process.argv.slice(2))
}
