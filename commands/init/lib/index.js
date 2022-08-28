"use strict"
const fs = require("fs")
const path = require("path")
const fse = require("fs-extra")
const semver = require("semver")
const userHome = require("user-home")
const inquirer = require("inquirer")
const Command = require("@cdp-wpm/command")
const Package = require("@cdp-wpm/package")
const log = require("@cdp-wpm/log")
const { spinnerStart } = require("@cdp-wpm/utils")
const getProjectTemplate = require("./getProjectTemplate")

const TYPE_PROJECT = "TYPE_PROJECT"
const TYPE_COMPONENT = "TYPE_COMPONENT"

const TEMPLATE_TYPE_NROMAL = "normal"
const TEMPLATE_TYPE_CUSTOM = "custom"

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ""
    console.log("projectName:", this.projectName)
  }

  async exec() {
    // 1、准备阶段
    // 2、下载模板
    // 3、安装模板
    try {
      const projectInfo = await this.prepare()
      console.log(projectInfo) // { type: 'TYPE_PROJECT', projectName: 'aa', projectVersion: '4.8.9' }

      // 将当前用户输入的信息也保存下来
      this.projectInfo = projectInfo
      // 下载模板
      await this.downloadTemplate()
      // 安装模板
      await this.installTemplate()
    } catch (e) {
      console.error(e.message)
    }
  }

  /**
   * 安装模板
   */
  async installTemplate() {
    // console.log(this.templateInfo)
    // {
    //   _id: '62f6fea2cdcd35e79a0773c6',
    //   name: 'vue2标准模板',
    //   npmName: 'cdp-wpm-template-vue2',
    //   version: '0.1.0',
    //   type: 'normal'
    // }
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        // 如果不存在type属性 赋值为标准类型
        this.templateInfo.type = TEMPLATE_TYPE_NROMAL
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NROMAL) {
        // 走标准安装
        await this.installNormalTemplate()
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 走自定义的安装
        await this.installCustomTemplate()
      } else {
        throw new Error("项目模板类型无法识别")
      }
    } else {
      // 抛出异常
      throw new Error("项目模板信息不存在")
    }
  }

  /**
   * 安装标准模板
   */
  async installNormalTemplate() {
    let spinner = spinnerStart("正在安装模板")
    try {
      // 获取缓存的目录
      const templatePath = path.resolve(
        this.templateNpm.cacheFilePath,
        "template"
      )
      // 命令执行的当前目录
      const targetPath = process.cwd()
      // 确保目录是存在的
      fse.ensureDirSync(templatePath)
      fse.ensureDirSync(targetPath)
      fse.copySync(templatePath, targetPath)
    } catch (error) {
      throw error
    } finally {
      spinner.stop(true)
      console.log("安装模板成功")
    }
  }

  async installCustomTemplate() {
    console.log("安装自定义模板")
  }

  /**
   * 通过项目模板API获取项目模板信息
   */
  async downloadTemplate() {
    // console.log(this.template,this.projectInfo)
    const { projectTemplate } = this.projectInfo
    // console.log(projectTemplate);
    const templateInfo = this.template.find((item) => {
      return item.npmName === projectTemplate
    })
    // 过滤模板信息保存在当前对象上面
    this.templateInfo = templateInfo
    // template 专门用来缓存项目的模板
    const targetPath = path.resolve(userHome, ".cdp-wpm-cli", "template")
    const storeDir = path.resolve(
      userHome,
      ".cdp-wpm-cli",
      "template",
      "node_modules"
    )
    const { npmName, version } = templateInfo
    const templateNpm = new Package({
      targetPath,
      storePath: storeDir,
      packageName: npmName,
      packageVersion: version,
    })
    // 这里打印 需要下载的模板实例
    // console.log(templateNpm);
    // Package {
    //   targetPath: '/Users/louis/.cdp-wpm-cli/template',
    //   storePath: '/Users/louis/.cdp-wpm-cli/template/node_modules',
    //   packageName: 'cdp-wpm-template-vue2',
    //   packageVersion: '0.1.0',
    //   cacheFilePathPrefix: 'cdp-wpm-template-vue2'
    // }
    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart("正在下载模板...")
      try {
        // 不存在这个目录 走下载模式
        await templateNpm.install()
      } catch (error) {
        throw new Error("下载模板失败")
      } finally {
        spinner.stop(true)
        if (await templateNpm.exists()) {
          log.success("下载模板成功")
          this.templateNpm = templateNpm
        }
      }
    } else {
      const spinner = spinnerStart("正在更新模板...")
      try {
        await templateNpm.update()
      } catch (error) {
        throw new Error("更新模板失败")
      } finally {
        spinner.stop(true)
        if (await templateNpm.exists()) {
          log.success("更新模板成功")
          this.templateNpm = templateNpm
        }
      }
    }
  }

  async prepare() {
    // 首先判断项目模板是否存在
    const template = await getProjectTemplate()
    // 这里在准备阶段做一个判空处理，如果模板信息不存在直接中断执行
    if (!template || template.length === 0) {
      throw new Error("项目模板不存在")
    }

    // 保存template实例
    this.template = template
    // console.log("进入准备函数");
    // 1、判断当前目录是否为空 首先要拿到当前的目录
    const localPath = process.cwd()

    if (!this.isCwdEmpty(localPath)) {
      // 询问是否继续创建模板
      const { ifContinue } = await inquirer.prompt({
        type: "confirm",
        name: "ifContinue",
        default: false,
        message: "当前文件夹不为空，是否继续创建项目？",
      })
      // console.log(ifContinue)
      if (ifContinue) {
        // 清空当前目录 这里为了误操作，给用户二次操作
        const { confirmDelete } = await inquirer.prompt({
          type: "confirm",
          name: "confirmDelete",
          default: false,
          message: "是否确认清空目录？",
        })
        if (confirmDelete === true) {
          fse.emptyDirSync(localPath)
        }
      }
    }
    // 还有一种方法可以拿到当前命令的执行目录
    // const localPath = path.resolve(".")
    // 2、是否启动强制更新
    // 3、选择创建项目或者组件
    // 4、获取项目的基本信息
    return this.getProjectInfo()
  }

  async getProjectInfo() {
    // 1、选择创建项目还是组件
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化的类型",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    })

    let projectInfo = {}

    if (type === TYPE_PROJECT) {
      // 2、获取用户输入的基本信息
      const project = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目的名称",
          default: "",
          validate: (v) => {
            return typeof v === "string"
          },
          filter: (v) => {
            return v
          },
        },
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目的版本号",
          default: "1.0.0",
          validate: function (v) {
            const done = this.async()
            setTimeout(() => {
              if (!semver.valid(v)) {
                done("请输入符合npm规范版本号")
              }
              done(null, true)
            }, 0)
            return !!semver.valid(v)
          },
          filter: (v) => {
            if (!!semver.valid(v)) {
              return semver.valid(v)
            }
            return v
          },
        },
        {
          type: "list",
          name: "projectTemplate",
          message: "请选择项目模板",
          choices: this.createTemplateChoices(),
        },
      ])
      projectInfo = {
        type,
        ...project,
      }
    } else if (type === TYPE_COMPONENT) {
    }
    // 返回项目的基本信息
    return projectInfo
  }

  // 项目模板的选择
  createTemplateChoices() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }))
  }

  // 将目录是否为空封装成一个单独的方法
  isCwdEmpty(localPath) {
    // fs.readdirSync 返回一个数组 当前文件的里面的文件夹的名称
    let fileList = fs.readdirSync(localPath)
    // 文件过滤的条件，在目前的场景中其实只需要判断文件夹不为空就认为需要清空
    // fileList = fileList.filter((file) => {
    //   !file.startsWith(".") && "node_modules".indexOf(file) < 0
    // })
    // console.log(fileList);
    // 如果过滤出来的文件是空的说明目录为空
    return !fileList || fileList.length <= 0
  }
}

function init(argv) {
  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
