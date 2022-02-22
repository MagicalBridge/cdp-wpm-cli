"use strict"


const log = require("npmlog")
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
log.heading = "cdp-wpm"
log.headingStyle = { fg: "yellow", bg: "black" }
log.addLevel("success", 2000, { fg: "green" })


module.exports = log

// function index() {
//   log.success("cli", "test")
// }
