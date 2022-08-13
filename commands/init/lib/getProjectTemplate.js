const request = require("@cdp-wpm/request")

module.exports = function () {
  return request({
    url: "/project/template",
  })
}
