/**
 * koav-http-proxy
 * @author  pplgin
 */

const request = require('request')


/**
 * promise request
 */
const fetch = (options) => {
  return new Promise((reslove, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        reject(err)
        return
      }
      reslove({ res, body })
    })
  })
}

const getParsedBody = (ctx, options) => {
  let _body = ctx.request.body;
  let _method = options.method;
  if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
    if (_body instanceof Object) {
      options.headers['content-type'] = 'application/json; charset=UTF-8';
      options.headers['accept'] = '*/*';
      delete options.headers['content-length'];
    }
    options.json = true;
    options.body = _body;
  }
}

const proxyResponse = (ctx, response) => {
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

  return async (ctx, next) => {
    // new options
    let _requestOpt = {};
    if (typeof hostmap !== 'string' && Array.isArray(hostmap)) {

      let proxyConf = hostmap.find(conf => {
        if (Array.isArray(conf.match)) {
          let proxyPath = conf.match.find(path => new RegExp(path).test(ctx.path))
          if (proxyPath) {
            return conf
          }
          return null
        }
        return new RegExp(conf.match).test(ctx.path)
      });

      // no match
      if (!proxyConf) return next();
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
    _requestOpt.method = ctx.method.toUpperCase();

    // load body data
    getParsedBody(ctx, _requestOpt);

    try {
      const {res, body} = await fetch(_requestOpt)
      proxyResponse(ctx, res);
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};
