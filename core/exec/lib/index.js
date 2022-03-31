"use strict"
const Package = require("@cdp-wpm/package")

const SETTINGS = {
  init: "@cdp-wpm/init"
}

function exec(currOption, currentArgs) {
  const targetPath = process.env.CLI_TARGET_PATH
  // const homePath = process.env.CLI_HOME_PATH
  // console.log(currOption)
  // console.log(currentArgs);
  const cmdName = currentArgs[0] // [ 'init', 'testproject' ]
  const packageName = SETTINGS[cmdName]
  const packageVersion = "latest"
  
  const pkg = new Package({
    targetPath,
    packageName,  
    packageVersion
  })
  console.log(pkg)
} 

module.exports = exec
