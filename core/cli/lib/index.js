"use strict"

const pkg = require("../package.json")

function core() {
  // console.log("core")
  checkPkgVersion()
}

function checkPkgVersion() {
  console.log(pkg.version)
}

module.exports = core
