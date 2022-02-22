"use strict"

const semver = require("semver")
const colors = require("colors/safe")
const pkg = require("../package.json")
const log = require("@cdp-wpm/log")
const constant = require("./constant")

function core() {
  // console.log("core")
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (error) {
    log.error(error)
  }
}

function checkPkgVersion() {
  log.info("cli", pkg.version)
}

function checkNodeVersion() {
  // 获取当前版本号
  let currentVersion = process.version
  let loweastNodeVersin = constant.LOWEAST_NODE_VERSION
  if (!semver.gte(currentVersion, loweastNodeVersin)) {
    throw new Error(colors.red(`cdp-wpm需要安装 v${loweastNodeVersin}以上版本的 Node.js`)) 
  }
}

module.exports = core
