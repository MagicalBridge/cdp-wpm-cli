"use strict"

/**
 * 判断是否是对象
 * @param {*} o 
 * @returns boolean
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

module.exports = {
  isObject
}
