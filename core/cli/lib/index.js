"use strict"

const semver = require("semver")
const colors = require("colors/safe")
const pkg = require("../package.json")
const userHome = require("user-home")
const pathExists = require("path-exists").sync
const log = require("@cdp-wpm/log")
const constant = require("./constant")

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    rootCheck()
    checkUserHome()
  } catch (error) {
    log.error(error)
  }
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
