"use strict"
const path = require("path")
const semver = require("semver")
const colors = require("colors/safe")
const pkg = require("../package.json")
const userHome = require("user-home")
const pathExists = require("path-exists").sync
const log = require("@cdp-wpm/log")
const constant = require("./constant")
let args
let config

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    rootCheck()
    checkUserHome()
    checkInputArgs()
    // log.verbose("debug","动态修改log level")
    checkEnv()
  } catch (error) {
    log.error(error)
  }
}

// 检查环境变量
function checkEnv() {
  const dotenvPath = path.resolve(userHome, ".env")
  if (pathExists(dotenvPath)) {
    // 使用这种方式能将配置文件中的变量放入 process.env中
    require("dotenv").config({
      path: dotenvPath,
    })
  }
  config = createDefaultConfig()
  console.log(process.env.CLI_HOME_PATH) 
}

// 针对没有设置缓存主目录
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome
  return cliConfig
}

// 检查入参
function checkInputArgs() {
  const minimist = require("minimist")
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose"
  } else {
    process.env.LOG_LEVEL = "info"
  }
  // 在确定好了 log——level 之后重新给他赋值
  log.level = process.env.LOG_LEVEL
}

// 检查包的版本
function checkPkgVersion() {
  log.info("cli", pkg.version)
}

// 检查node版本
function checkNodeVersion() {
  // 获取当前版本号
  let currentVersion = process.version
  let loweastNodeVersin = constant.LOWEAST_NODE_VERSION
  if (!semver.gte(currentVersion, loweastNodeVersin)) {
    throw new Error(
      colors.red(`cdp-wpm需要安装 v${loweastNodeVersin}以上版本的 Node.js`)
    )
  }
}

function checkUserHome() {
  // console.log(userHome)
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前用户主目录不存在"))
  }
}

// 检查用户root权限
function rootCheck() {
  const rootCheck = require("root-check")
  rootCheck()
  // console.log(process.geteuid());
}

module.exports = core
