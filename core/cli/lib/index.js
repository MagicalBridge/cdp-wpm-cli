"use strict"
const path = require("path")
const semver = require("semver")
const colors = require("colors/safe")
const pkg = require("../package.json")
const userHome = require("user-home")
const pathExists = require("path-exists").sync
const log = require("@cdp-wpm/log")
const init = require("@cdp-wpm/init")
const constant = require("./constant")
const commander = require("commander")

let args
let config

// 注册一个命令
const program = new commander.Command()

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    rootCheck()
    checkUserHome()
    checkInputArgs()
    // log.verbose("debug","动态修改log level")
    checkEnv()
    checkGlobalUpdate()
    registerCommand()
  } catch (error) {
    log.error(error)
  }
}

// 注册命令方法
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0]) // 从 pkg 中
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", '')

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action( async (currOption) => {
      // 这里在按照讲师的代码书写的时候遇到了一些问题，拿不到参数
      // 尝试使用
      const globalOpts = program.opts()
      await init(currOption, globalOpts)
    })
  
  program.on("option:debug", function () {
    const opts = program.opts()
    const { debug } = opts
    if (debug) {
      process.env.LOG_LEVEL = "verbose"
    } else {
      process.env.LOG_LEVEL = "info"
    }
    log.level = process.env.LOG_LEVEL
    // log.verbose("debug")
  })


  // program.on("option:targetPath", function () {
  //   const opts = program.opts()
  //   console.log(opts)
  // })

  // 对未知命令的监听
  program.on("command:*", function (obj) {
    console.log(colors.red(`未知的命令：${obj[0]}`))
    // console.log(obj); // ["test"]
    const availableCommands = program.commands.map((cmd) => cmd.name)
    if (availableCommands.length > 0) {
      console.log(colors.green(`可用的命令${availableCommands.join(",")}`))
    }
  })

  // 当输入的命令中参数小于3 说明没有执行命令
  // console.log(process.argv)
  // [
  //   '/Users/louis/.nvm/versions/node/v14.16.0/bin/node',
  //   '/Users/louis/.nvm/versions/node/v14.16.0/bin/cdp-wpm',
  //   'test'
  // ]
  if (process.argv.length < 3) {
    program.outputHelp()
    console.log()
  }

  program.parse(process.argv)
}

// 检查最新的版本号
async function checkGlobalUpdate() {
  // 1、获取当前的版本号
  const currentVersion = pkg.version
  const npmName = pkg.name
  // 2、获取npm的信息
  const { getNpmSemverVersion } = require("@cdp-wpm/get-npm-info")
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)

  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(
        `请手动更新 ${npmName} 当前版本:${currentVersion}, 最新版本:${lastVersion}`
      )
    )
  }
}

// 检查环境变量
function checkEnv() {
  const dotenvPath = path.resolve(userHome, ".env")
  if (pathExists(dotenvPath)) {
    // 使用这种方式能将配置文件中的变量放入 process.env中
    require("dotenv").config({
      path: dotenvPath,
    })
  }
  config = createDefaultConfig()
  // 打印缓存主目录
  console.log(process.env.CLI_HOME_PATH)
}

// 针对没有设置缓存主目录
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome
  return cliConfig
}

// 检查入参
function checkInputArgs() {
  const minimist = require("minimist")
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose"
  } else {
    process.env.LOG_LEVEL = "info"
  }
  // 在确定好了 log——level 之后重新给他赋值
  log.level = process.env.LOG_LEVEL
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
