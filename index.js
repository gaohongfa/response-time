/*!
 * response-time
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies
 * @private
 */

var deprecate = require('depd')('response-time')//弃用：这将在STDERR上显示一个弃用的消息“oldfunction”从“response—time”弃用。
var onHeaders = require('on-headers')//onHeaders(res, listener).listener为监听的对象。

/**
 * Module exports.
 * @public
 */

module.exports = responseTime

/**
 * Create a middleware to add a `X-Response-Time` header displaying 创建一个中间件添加` x-response-time `标题显示
 * the response duration in milliseconds.响应持续时间为毫秒
 *
 * @param {object|function} [options] 对象或函数类型的参数
 * @param {number} [options.digits=3] 
 * @param {string} [options.header=X-Response-Time]
 * @param {boolean} [options.suffix=true]
 * @return {function}
 * @public
 */

function responseTime (options) {
  var opts = options || {}

  if (typeof options === 'number') {
    // back-compat single number argument
    deprecate('number argument: use {digits: ' + JSON.stringify(options) + '} instead')
    opts = { digits: options }
  }

  // get the function to invoke
  var fn = typeof opts !== 'function'
    ? createSetHeader(opts)
    : opts

  return function responseTime (req, res, next) {
    var startAt = process.hrtime()

    onHeaders(res, function onHeaders () {
      var diff = process.hrtime(startAt)
      var time = diff[0] * 1e3 + diff[1] * 1e-6

      fn(req, res, time)
    })

    next()
  }
}

/**
 * Create function to set respoonse time header.
 * @private
 */

function createSetHeader (options) {
  // response time digits
  var digits = options.digits !== undefined
    ? options.digits
    : 3

  // header name
  var header = options.header || 'X-Response-Time'

  // display suffix
  var suffix = options.suffix !== undefined
    ? Boolean(options.suffix)
    : true

  return function setResponseHeader (req, res, time) {
    if (res.getHeader(header)) {
      return
    }

    var val = time.toFixed(digits)

    if (suffix) {
      val += 'ms'
    }

    res.setHeader(header, val)
  }
}
