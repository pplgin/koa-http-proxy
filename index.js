/**
 * koav-http-proxy
 * @author  pplgin
 */
const request = require('request')
const multer = require('multer')()

/**
 * promise request
 */
function fetch(options) {
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

/**
 * [parsedBody description]
 * @param  {[type]} ctx     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
async function parsedBody(ctx, options) {
  let _body = ctx.request.body
  let _method = options.method
  if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
    switch (true) {
      case ctx.is('multipart') === 'multipart':
        await new Promise((resolve, reject) => {
          multer.any()(_req, _res, err => {
            err ? reject(err) : resolve(ctx.req)
          })
        })
        delete options.headers['content-type']
        let file = ctx.req.files[0]
        options.formData = {
          [file.originalname]: {
            value: file.buffer,
            options: {
              filename: file.originalname,
              contentType: file.mimetype
            }
          }
        }
        break
      default:
        options.headers['content-type'] = 'application/json; charset=UTF-8'
        options.headers['accept'] = '*/*'

        options.json = true
        options.body = _body
        break
    }
    delete options.headers['content-length']
  }
}

/**
 * [proxyResponse description]
 * @param  {[type]} ctx [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function proxyResponse(ctx, res) {
  for (let key in res.headers) {
    ctx.response.set(key, res.headers[key])
  }
  ctx.body = res.body || res.statusMessage
  ctx.response.status = res.statusCode
}

/**
 * proxy config
 * @param  {[array]} proxies [description]
 * eg:
 * [{
 *   target: string, //remote address
 *   path: [string|array],  // match path
 *   headers: object, // cooke、ua 、contenType ...
 *   beforeSend: (req) => {}, // beforesend rewarite url or headers ...
 * }]
 */
module.exports = proxies => {
  // check options type
  if (!Array.isArray(proxies)) {
    throw new TypeError('options type should be array!')
  }

  // change to obj
  const proxyObj = proxies.reduce((caches, conf) => {
    let { path, ...opts } = conf
    if (Array.isArray(path)) {
      path = [].concat.apply([], path)
      path.forEach(key => {
        caches[key] = opts
      })
      return caches
    }

    if (typeof path === 'string') {
      caches[path] = opts
      return caches
    }

    throw new Error(`proxy path: ${path} must be string or array`)
  }, {})

  return async (ctx, next) => {

    const matchKey = Object.keys(proxyObj).find(key => new RegExp(key).test(ctx.path))

    // no match
    if (!matchKey) return next()
  
    const config = proxyObj[matchKey]

    if (!config.target) {
      throw new Error(`proxy target: ${target} be required!`)
    }

    let options = Object.assign({
        jar: true
      },
      {
        url: config.target + ctx.url,
        headers: config.headers || {}
      }
    )

    // remvoe accept-encoding
    delete options.headers['accept-encoding']
    options.method = ctx.method.toUpperCase()

    // load body data
    parsedBody(ctx, options)

    if (config.beforeSend && typeof config.beforeSend === 'function') {
      config.beforeSend(ctx, options)
    }

    try {
      const { res, body } = await fetch(options)
      proxyResponse(ctx, res)
    } catch (err) {
      ctx.throw(500, err)
    }
  }
}
