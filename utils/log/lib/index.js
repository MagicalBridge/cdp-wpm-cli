"use strict"


const log = require("npmlog")
// 这是一个静态属性
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
log.heading = "cdp-wpm"
log.headingStyle = { fg: "yellow", bg: "black" }
log.addLevel("success", 2000, { fg: "green" })


module.exports = log

// function index() {
//   log.success("cli", "test")
// }
