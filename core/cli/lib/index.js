"use strict"
const path = require("path")
const semver = require("semver")
const colors = require("colors/safe")
const pkg = require("../package.json")
const userHome = require("user-home")
const pathExists = require("path-exists").sync
const log = require("@cdp-wpm/log")
const init = require("@cdp-wpm/init")
const exec = require("@cdp-wpm/exec")
const constant = require("./constant")
const commander = require("commander")

// let args
let config

// 注册一个新的命令
const program = new commander.Command()

function core() {
  try {
    // 准备阶段
    // 1. 首先检查版本号
    checkPkgVersion()
    // 2. 检查node版本功能
    checkNodeVersion()
    // 3. 检查root启动
    rootCheck()
    // 4. 检查用户主目录
    checkUserHome()
    // 5. 检查用户入参 是不是debug 模式
    checkInputArgs()
    // 6. 检查用户的环境变量
    checkEnv()
    // 7. 检查包是否是最新的版本
    checkGlobalUpdate()
    // 命令注册
    registerCommand()
  } catch (error) {
    log.error(error)
  }
}

// 注册命令方法
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0]) // 从 pkg 中
    .usage("<command> [options]") // 给出一个使用的建议
    .version(pkg.version) // 展示出来版本号
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "")

  // 这是脚手架的高级功能，监听某一个命令 
  program.on("option:debug", function () {
    // 输入的option 可以从 program.opts() 中拿到
    const opts = program.opts()
    const { debug } = opts
    if (debug) {
      process.env.LOG_LEVEL = "verbose"
    } else {
      process.env.LOG_LEVEL = "info"
    }
    log.level = process.env.LOG_LEVEL
  })

  // 这种属性监听，其实都是会在 action 之前进行执行
  program.on("option:targetPath", function () {
    const opts = program.opts()
    const { targetPath } = opts
    if (targetPath) {
      // 将targetPath 设置到全局
      process.env.CLI_TARGET_PATH = targetPath
    }
  })

  // 对未知命令的监听 命令一般是 cdp-wpm test 这种执行形式
  program.on("command:*", function (obj) {
    // console.log(obj); // ["test"]
    console.log(colors.red(`未知的命令：${obj[0]}`))

    // TODO 下面这些代码不可用
    // const availableCommands = program.commands.map((cmd) => cmd.name)
    // if (availableCommands.length > 0) {
    //   console.log(colors.green(`可用的命令${availableCommands.join(",")}`))
    // }
  })

  program
    .command("init <projectName>") // 指定init命令的时候，跟上一个项目名称
    .option("-f, --force", "是否强制初始化项目") // 强制初始化时候可能会覆盖当前的文件目录
    .action(async (currOption) => {
      // currOption 对应的就是 projectName
      // 这里在按照讲师的代码书写的时候遇到了一些问题，拿不到参数
      // 尝试使用 program.opts()获取到全局的option。
      // 想要拿到 command 参数，需要使用 program.args方法
      // await init(currOption, globalOpts)
      const currentArgs = program.args
      await exec(currOption, currentArgs)
    })

  // 当输入的命令中参数小于3 说明没有执行命令 直接打印帮助文档
  // console.log(process.argv)
  // [
  //   '/Users/louis/.nvm/versions/node/v14.16.0/bin/node',
  //   '/Users/louis/.nvm/versions/node/v14.16.0/bin/cdp-wpm',
  //   'test'
  // ]
  if (process.argv.length < 3) {
    program.outputHelp()
    console.log();
  } else {
    // 这个parse都是必须的
    program.parse(process.argv)
  }
}

// 检查最新的版本号
async function checkGlobalUpdate() {
  // 1、获取当前的版本号 这些信息都是可以从 package.json 文件中获取
  const currentVersion = pkg.version
  const npmName = pkg.name

  // 2、获取npm的信息 调用npm api
  const { getNpmSemverVersion } = require("@cdp-wpm/get-npm-info")

  // 3、提取所有的版本号，比对哪些版本号是大于当前版本号
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)

  // 4、获取最新的版本号，提示用户更新到该版本
  // 如果从线上获取的版本大于当前的版本 提示用户更新
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
  // 获取用户的主目录
  const dotenvPath = path.resolve(userHome, ".env")
  if (pathExists(dotenvPath)) {
    // 使用这种方式能将配置文件中的变量放入 process.env中
    // 执行完毕这个代码之后，process.env.CLI_HOME_PATH 就已经可以拿到了
    // dotenv 这个库确实很好用
    require("dotenv").config({
      path: dotenvPath,
    })
  }
  // 有时候用户本地是没有 缓存主目录的，我们可以做一些判断
  // 如果用户本地没有缓存主目录，我们可以帮他生成一个
  config = createDefaultConfig()
  // 打印缓存主目录
  // console.log(process.env.CLI_HOME_PATH) => /Users/louis/.cdp-wpm
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
  // 将生成的path 直接赋值给环境变量
  process.env.CLI_HOME_PATH = cliConfig.cliHome
  return cliConfig
}

// 检查入参
function checkInputArgs() {
  const minimist = require("minimist")
  const args = minimist(process.argv.slice(2))
  // 如果我们在 命令后面 添加了 --debug 这个命令 {debug:true} 就会写入到 args 这个参数中
  checkArgs(args)
}

function checkArgs(args) {
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
  // node 中可以直接操作 .json 文件
  log.info("cli", pkg.version)
}

// 检查node版本
function checkNodeVersion() {
  // 获取当前版本号 可以使用 process.version
  let currentVersion = process.version
  // 从常量中找到配置的最新的版本号
  let loweastNodeVersin = constant.LOWEAST_NODE_VERSION
  // 如果当前版本小于 最小的版本 警告报错
  if (!semver.gte(currentVersion, loweastNodeVersin)) {
    throw new Error(
      colors.red(`cdp-wpm需要安装 v${loweastNodeVersin}以上版本的 Node.js`)
    )
  }
}

// 后续会存放一些东西在用户的主目录下。
function checkUserHome() {
  // console.log(userHome) // /Users/louis
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前用户主目录不存在"))
  }
}

// 检查用户root权限，为什么要做这种操作，因为我们有时候，我们会涉及文件操作
// 如果以超级管理员的创建的文件，普通用户的身份就没有办法进行修改，因为我们
// 需要进行一些降级的方案
function rootCheck() {
  const rootCheck = require("root-check")
  rootCheck()
  // console.log(process.geteuid());
}

module.exports = core
