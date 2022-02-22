"use strict"

const pkg = require("../package.json")
const log = require("@cdp-wpm/log")

function core() {
  // console.log("core")
  checkPkgVersion()
}

function checkPkgVersion() {
  console.log(pkg.version)
  log()
}

module.exports = core
