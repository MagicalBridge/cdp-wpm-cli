"use strict"

const path = require("path")

// 针对window上和mac上路径分割的差异，执行不同的逻辑
function formatPath(p) {
  if (p && typeof p === "string") {
    // 这里把模块的分隔符拿到
    const sep = path.sep
    if (sep === "/") {
      return p
    } else {
      return p.replace(/\\/g, "/")
    }
  }
}

module.exports = formatPath
