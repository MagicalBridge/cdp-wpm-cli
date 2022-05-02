"use strict"
const Package = require("@cdp-wpm/package")
const path = require("path")
// const userHome = require("user-home")

const SETTINGS = {
  init: "@cdp-wpm/init",
}

// 这个变量会拼接在主目录下面的一个文件夹里面
const CATCH_DIR = "dependencies"

async function exec(currOption, currentArgs) {
  // 我们全局监听了 targetPath 这个options 然后放进了环境变量中 做了了业务逻辑的解耦
  let targetPath = process.env.CLI_TARGET_PATH
  // 设置缓存路径
  let storePath = ""
  let pkg
  const homePath = process.env.CLI_HOME_PATH
  const cmdName = currentArgs[0] // [ 'init', 'testproject' ]
  const packageName = SETTINGS[cmdName]
  const packageVersion = "latest"
  // 这里老师说：将targetPath 映射成为 modulePath
  // 然后将 modulePath 映射成为 package(npm模块)

  // 如果用户在执行命令的时候没有携带缓存路径
  if (!targetPath) {
    // 我们就手动生成缓存路径
    targetPath = path.resolve(homePath, CATCH_DIR)
    storePath = path.resolve(targetPath, "node_modules")
    // console.log(targetPath) // /Users/louis/.cdp-wpm-cli/dependencies
    // console.log(storePath) // /Users/louis/.cdp-wpm-cli/dependencies/node_modules

    // Package 中提供入口文件等一些api方法 没有传递缓存路劲
    pkg = new Package({
      targetPath,
      storePath,
      packageName,
      packageVersion,
    })
    // 如果包存在的话 走的是更新pkg逻辑 
    if (await pkg.exists()) {
      await pkg.update()
    } else { // 不存在 安装包逻辑
      // install 返回的是一个promise 这是使用await保证同步执行逻辑
      await pkg.install()
      console.log("包安装完毕=============");
    }
  } else {
    //targetpath 被指定了，可能是为了调试安装这个模块
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }
  // console.log(pkg.getRootFilePath())
  // 最终会拿到这个文件，并且执行
  const rootFile = pkg.getRootFilePath()
  // 如果返回是一个function的话执行执行起来
  // cdp-wpm init testproject -tp /Users/louis/Documents/myProject/cdp-wpm-cli/commands/init
  if (rootFile) {
    require(rootFile)()
  } else {
    return null
  }
}

module.exports = exec
