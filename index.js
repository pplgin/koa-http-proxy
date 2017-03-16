/**
 * koa-http-proxy
 * @author  pplgin
 * @email   johnnyjiang813@gmail.com
 * @createTime          2017-03-16T12:47:44+0800
 */

const request = require('co-request');

// 获取body参数
function* getParsedBody(ctx, options) {
  let _body = ctx.request.body;
  let _method = options.method;
  // load body data
  if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
    if (_body instanceof Object && !options.headers['x-requested-with']) {
      options.headers['content-type'] = 'application/json; charset=UTF-8';
      options.headers['accept'] = '*/*';
      delete options.headers['content-length'];
    }
    options.json = true;
    options.body = _body;
  }
}

// 处理response header
function* proxyResponse(ctx, response) {
  // 循环替换headers内容
  for (var key in response.headers) {
    ctx.response.set(key, response.headers[key]);
  }
  ctx.body = response.body;
  ctx.response.status = response.statusCode;
}

module.exports = (mapHost, options)=>{
  if (!mapHost) {
    throw new Error('mapHost should not be empty')
  }
  options = options || {};


  return function* handleProxy(next) {
    let ctx = this;
    // match api rules
    if (options.match && !ctx.path.match(options.match)) {
      return yield * next;
    }
    // method 强制 method
    options.method = options.method || ctx.method.toUpperCase();

    // request options
    options.headers = Object.assign(ctx.request.headers, options.headers || {});

    // remvoe accept-encoding
    delete options.headers['accept-encoding'];

    let _requestOpt = {
      url: mapHost + ctx.url,
      method: options.method,
      headers: options.headers
    };


    // load body data
    yield getParsedBody(ctx, _requestOpt);

    try {
      let response = yield request(_requestOpt);
      // response
      yield proxyResponse(ctx, response);
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};