"use strict"

const { isObject } = require("@cdp-wpm/utils")
const pkgDir = require("pkg-dir").sync
const pathExits = require("path-exists").sync
const path = require("path")
const formatPath = require("@cdp-wpm/format-path")
const fse = require("fs-extra")
const npminstall = require("npminstall")
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@cdp-wpm/get-npm-info")

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
    // package的缓存目录的前缀
    this.cacheFilePathPrefix = this.packageName.replace("/", "_")
  }

  // 这是个准备方法 用来处理一些版本号的问题，虽然安装的时候 我们传递的是latest
  // 但是实际上我们获取包的缓存的信息的时候还是需要带上版本号的
  async prepare() {
    // 如果缓存目录不存在的话生成缓存目录
    if (this.storePath && !pathExits(this.storePath)) {
      // 同步方法，将所有的缓存目录都创建好
      fse.mkdirpSync(this.storePath)
    }

    // 有时候传递过来的值会是 latest
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
      console.log("当前包的最新版本号: " + this.packageVersion)
    }
    // console.log(this.packageVersion)
  }

  // 实际安装的包的路径是经过特殊处理的，为了识别这种情况，我们来处理下路径名称
  // 这里使用类的一个特性使用get 标识要操作的方法
  get cacheFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    )
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    )
  }

  // 判断当前的package是否存在
  // storePath这个缓存路径的赋值是在没有传递targetPath的场景下赋值的。
  async exists() {
    if (this.storePath) {
      // 缓存模式
      // 这个准备方法的作用是将我们传递的latest转换成真的版本号
      await this.prepare()
      console.log("缓存路径: " + this.cacheFilePath)
      return pathExits(this.cacheFilePath)
    } else {
      // 说明传递了 targetPath 直接使用现有的api进行判断即可
      return pathExits(this.targetPath)
    }
  }
  // 安装package
  async install() {
    await this.prepare()
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
  async update() {
    await this.prepare()
    // 1、获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    // 2、查询下，最新的版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    // 3、如果不存在，则直接安装最新的版本
    if (!pathExits(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storePath, // 缓存的路径
        registry: getDefaultRegistry(true),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion,
          },
        ],
      })
      // 安装完成之后，对版本号进行更新
      this.packageVersion = latestPackageVersion
    }
    // 如果已经存在了，直接将最新版本的路径返回出去
    return latestFilePath
  }
  // 获取入口文件路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1、获取targetpath 下面的package.json所在的目录 需要使用 pkg-dir 这个仓库
      // /Users/louis/Documents/myProject/cdp-wpm-cli/commands/init
      // 使用这个模块的原因是，做一个兼容处理 如果我们传递的目录是更深层级的，
      // 那么依然会返回这个目录
      const dir = pkgDir(targetPath)
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
    if (this.storePath) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
 