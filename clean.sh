#! /usr/bin/env bash

# 删除package-lock.json文件
rm -rf package-lock.json 
rm -rf lerna-debug.log
rm -rf core/**/package-lock.json 
rm -rf utils/**/package-lock.json 
rm -rf commands/**/package-lock.json
rm -rf models/**/package-lock.json