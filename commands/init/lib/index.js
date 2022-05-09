"use strict"

const Command = require("@cdp-wpm/command")

class InitCommand extends Command {}

function init(currOption, globalOpts) {
  return new InitCommand()
}

module.exports = init
module.exports.InitCommand = InitCommand
