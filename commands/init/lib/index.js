"use strict"

const Command = require("@cdp-wpm/command")

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ""
    console.log(this.projectName)
  }

  exec() {
    console.log('执行exec方法');
  }
}

function init(argv) {
  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
