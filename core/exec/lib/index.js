"use strict"
const Package = require("@cdp-wpm/package")

const SETTINGS = {
  init: "@cdp-wpm/init"
}

function exec(currOption, currentArgs) {
  // 我们全局监听了 targetPath 这个options 然后放进了环境变量中 做了了业务逻辑的解耦
  const targetPath = process.env.CLI_TARGET_PATH
  // const homePath = process.env.CLI_HOME_PATH
  const cmdName = currentArgs[0] // [ 'init', 'testproject' ]
  const packageName = SETTINGS[cmdName]
  const packageVersion = "latest"
  // 这里老师说：将targetPath 映射成为 modulePath
  // 然后将 modulePath 映射成为 package(npm模块)
  // Package 中提供入口文件等一些api方法
  const pkg = new Package({
    targetPath,
    packageName,  
    packageVersion
  })
  console.log(pkg)
} 

module.exports = exec
