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
 * 使用方式
 */
app.use(proxy('http://192.168.22.126/',{
  match: '/webapi/',
  headers:{
    'host':'dev1cctalk.hujiang.com'
  },
  jar: true
}))
//proxy('代理urk',{
    match:'', // api 路径包含项
    headers, // 设置请求的header
    jar://是否cookies
  })
```



