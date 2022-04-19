"use strict"

const { isObject } = require("@cdp-wpm/utils")
const pkgDir = require("pkg-dir").sync
const path = require("path")
const formatPath = require("@cdp-wpm/format-path")
const npminstall = require("npminstall")
const { getDefaultRegistry } = require("@cdp-wpm/get-npm-info")

class Package {
  constructor(opts) {
    if (!opts) {
      throw new Error("package类的options参数不能为空")
    }
    if (!isObject(opts)) {
      throw new Error("package类的options参数必须为对象")
    }
    // 获取package的路径
    this.targetPath = opts.targetPath
    // package 的缓存路径 一般是目标路径的基础上加上一层 node_modules 层级路径
    this.storePath = opts.storePath
    // package的name
    this.packageName = opts.packageName
    // package的version
    this.packageVersion = opts.packageVersion
  }
  // 判断当前的package是否存在
  exists() {}
  // 安装package
  install() {
    // 返回的是一个方法
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath, // 缓存的路径
      registry: getDefaultRegistry(true),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    })
  }
  // 更新package
  update() {}
  // 获取入口文件路径
  getRootFilePath() {
    // 1、获取targetpath 下面的package.json所在的目录 需要使用 pkg-dir 这个仓库
    // /Users/louis/Documents/myProject/cdp-wpm-cli/commands/init
    // 使用这个模块的原因是，做一个兼容处理 如果我们传递的目录是更深层级的，
    // 那么依然会返回这个目录
    const dir = pkgDir(this.targetPath)
    // 目录存在的情况
    if (dir) {
      // 2、读取这个文件 package.json
      const pkgFile = require(path.resolve(dir, "package.json"))
      // 3、找到 main 或者 lib 的 key
      if (pkgFile && pkgFile.main) {
        // 4、路径的兼容 mac 和 windows
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }
}

module.exports = Package
