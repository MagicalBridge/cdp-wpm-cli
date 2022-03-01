"use strict"

const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")

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

function getDefaultRegistry(isOriginal = true) {
  // 这里的镜像地址上次还出现过一次问题
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npmmirror.com"
}

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

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
}
