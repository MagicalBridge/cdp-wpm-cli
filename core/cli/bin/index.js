#! /usr/bin/env node 

const importLocal = require("import-local")

if(importLocal(__filename)) {
  require("npmlog").info("cdp-cli","正在使用 cdp-cli 本地安装版本")
} else {
  require("../lib")(process.argv.slice(2))
}
