/**
 * koa-http-proxy
 * @author  pplgin
 * @email   johnnyjiang813@gmail.com
 * @createTime          2017-03-16T12:47:44+0800
 */

const { defaults } = require('co-request');
const request = defaults({encoding:null})

// deal body parse
const getParsedBody = (ctx, options)=>{
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

// deal response header
const proxyResponse = (ctx, response)=>{
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


  return (ctx,next)=>{
    // match api rules
    if (options.match && !ctx.path.match(options.match)) {
      return next();
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
    getParsedBody(ctx, _requestOpt);
    try {
      return request(_requestOpt).then((res)=>{
        // set response header
        proxyResponse(ctx, res);
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};