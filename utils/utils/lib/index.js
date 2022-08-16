"use strict"

/**
 * 判断是否是对象
 * @param {*} o 
 * @returns boolean
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function spinnerStart(msg, spinnerString = "|/-\\") {
  const Spinner = require("cli-spinner").Spinner
  const spinner = new Spinner(msg + '%s');
  spinner.setSpinnerString(spinnerString)
  spinner.start()
  return spinner
}

module.exports = {
  isObject,
  spinnerStart
}
