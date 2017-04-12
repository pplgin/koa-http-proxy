/**
 * koa-http-proxy
 * @author  pplgin
 * @email   johnnyjiang813@gmail.com
 * @createTime          2017-03-16T12:47:44+0800
 */

const {
  defaults
} = require('co-request');
const request = defaults({
  encoding: null
})

// deal body parse
const getParsedBody = (ctx, options) => {
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
const proxyResponse = (ctx, response) => {
  // 循环替换headers内容
  for (var key in response.headers) {
    ctx.response.set(key, response.headers[key]);
  }
  ctx.body = response.body;
  ctx.response.status = response.statusCode;
}

module.exports = (hostmap, options) => {
  if (!hostmap) {
    throw new Error('hostmap should not be empty')
  }
  options = options || {};


  return (ctx, next) => {
    // new options
    let _requestOpt = {};
    if (typeof hostmap !== 'string' && hostmap.constructor.name.toLocaleLowerCase() === 'array') {
      let proxyConf = hostmap.filter((conf) => {
        return ctx.path.match(conf.match);
      });

      // no match
      if (!proxyConf.length) return next();
      // list get first one
      proxyConf = proxyConf[0];

      _requestOpt = Object.assign(_requestOpt, {
        url: proxyConf.target + ctx.url,
        headers: proxyConf.headers || {}
      })

    } else {

      // match api rules
      if (options.match && !ctx.path.match(options.match)) {
        return next();
      }

      _requestOpt = {
        url: hostmap + ctx.url,
        headers: options.headers || {}
      };
    }

    // request options
    _requestOpt.headers = Object.assign(ctx.request.headers, _requestOpt.headers || {});

    // remvoe accept-encoding
    delete _requestOpt.headers['accept-encoding'];

    // not suppport method
    _requestOpt.method = ctx.method.toUpperCase();

    // load body data
    getParsedBody(ctx, _requestOpt);

    try {
      return request(_requestOpt).then((res) => {
        // set response header
        proxyResponse(ctx, res);
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};