"use strict"

const semver = require("semver")
const colors = require("colors")
const log = require("@cdp-wpm/log")
const LOWEAST_NODE_VERSION = "12.0.0"

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("参数不能为空!")
    }

    if (!Array.isArray(argv)) {
      throw new Error("参数必须为数组！")
    }

    if (argv.length < 1) {
      throw new Error("参数列表不能为空！")
    }

    this._argv = argv
    // 借助promise 直接 new Command 就会执行 下面的逻辑
    this.runner = new Promise((resolve, reject) => {
      // 返回的chain 也是一个promsie
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      // 下面的方法就是执行用户自己的逻辑了
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      // 监听promsie的异常
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
    throw new Error("init方法必须实现")
  }

  exec() {
    throw new Error("exec方法必须实现")
  }
}

module.exports = Command
