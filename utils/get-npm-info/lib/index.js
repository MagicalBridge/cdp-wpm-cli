"use strict"

const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")

// 调用npm的api用于获取某个包的信息
function getNpmInfo(npmName, registry) {
  // console.log(npmName);
  if (!npmName) {
    return null
  }

  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)

  // 请求接口
  return axios
    .get(npmInfoUrl)
    .then((response) => {
      if (response.status === 200) {
        // console.log(response.data)
        return response.data
      } else {
        return null
      }
    })
    .catch((err) => {
      Promise.reject(err)
    })
}

// 我们可能会使用淘宝镜像源 所以这里需要提供多个路径
function getDefaultRegistry(isOriginal = true) {
  // 这里的镜像地址上次还出现过一次问题
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npmmirror.com"
}

// 最终对外提供的是这个方法
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

// 获取所有满足条件的版本号
function getSemverVersions(baseVersion, versions) {
  versions = versions.filter((version) => semver.gt(version, baseVersion))
  return versions
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  // 拿到的是所有的版本号 这里返回的版本号 是 [0.0.2].... [0.0.14] 这种形式
  const versions = await getNpmVersions(npmName, registry)
  // 过滤出来新的版本号 都是
  const newVersions = getSemverVersions(baseVersion, versions)
  // console.log(newVersions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[newVersions.length - 1]
  }
}

// 获取最新的版本号
async function getNpmLatestVersion(npmName) {
  const registry = getDefaultRegistry(true)
  const versions = await getNpmVersions(npmName, registry)
  // 拿到的是一个数组，返回第一个就好
  if (versions.length > 0) {
    return versions[0]
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
}
