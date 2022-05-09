"use strict"

const semver = require("semver")
const colors = require("colors")
const log = require("@cdp-wpm/log")
const LOWEAST_NODE_VERSION = "12.0.0"

class Command {
  constructor() {
    console.log("Command constructor")
    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain.catch((err) => {
        log.error(err.message)
      })
    })
  }

  // 检查node版本
  checkNodeVersion() {
    // 获取当前版本号 可以使用 process.version
    let currentVersion = process.version
    // 从常量中找到配置的最新的版本号
    let loweastNodeVersin = LOWEAST_NODE_VERSION
    // 如果当前版本小于 最小的版本 警告报错
    if (!semver.gte(currentVersion, loweastNodeVersin)) {
      throw new Error(
        colors.red(`cdp-wpm需要安装 v${loweastNodeVersin}以上版本的 Node.js`)
      )
    }
  }

  // 初始化参数的方法
  initArgs() {}

  init() {
    throw new Error("init 必须实现")
  }

  exec() {
    throw new Error("exec 必须实现")
  }
}

module.exports = Command
