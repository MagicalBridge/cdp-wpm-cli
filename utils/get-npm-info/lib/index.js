"use strict"

const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")

function getNpmInfo(npmName, registry) {
  // console.log(npmName);
  if (!npmName) {
    return null
  }

  const registryUrl = registry || getDefaultRegistry();
}

function getDefaultRegistry(isOriginal = false) {
  // 这里的镜像地址上次还出现过一次问题
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npmmirror.com"
}

module.exports = {
  getNpmInfo,
}
