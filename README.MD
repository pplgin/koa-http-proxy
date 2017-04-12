#### koa-api-proxy

koa2 http proxy middleware

目前支持： http 基本请求 post，get,put

待解决: 文件上传

使用方法：
```
const Koa = require('koa')
const app = new Koa();
const proxy = require('./')


/**
 * use config single
 * @type {[type]}
 */
app.use(proxy('http://www.google.com', {
  match: '/test',
  jar: true
}))

/**
 * use config multi
 * @type {[type]}
 */
app.use(proxy([{
  target: 'http://www.google.com',
  match: '/dist',
  jar: true
}, {
  target: 'http://www.yahoo.com',
  match: '/t',
  jar: true
}]))

```



