"use strict"

const axios = require("axios")
// 这里可以将BASE_URL作为一个配置，现在先写死为本地的文件
const BASE_URL = "http://127.0.0.1:7001"

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

// 请求拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

module.exports = request
