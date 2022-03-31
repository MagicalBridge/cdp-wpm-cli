"use strict"

const {isObject} = require("@cdp-wpm/utils")

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
    // package 的缓存路径
    this.storePath = opts.storePath
    // package的name
    this.packageName = opts.packageName
    // package的version
    this.packageVersion = opts.packageVersion
  }
  // 判断当前的package是否存在
  exists() {}
  // 安装package
  install() {}
  // 更新package
  update() {}
  // 获取入口文件路径
  getRootFilePath() {
    // 1、获取targetpath 下面的package.json所在的目录 pkg-dir
    // 2、读取这个文件
    // 3、找到main 或者 lib
    // 4、路径的兼容 mac 和 windows
  }
}

module.exports = Package
