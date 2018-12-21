## koa-api-proxies

> koa2 http proxy middleware

###　Support

post、get、put、delete 基本请求, 文件上传

###　Use

```
npm install koa-api-proxies
```

### ProxyConfig

| 参数 | 类型 |说明|
|---|---|---|
| target | string | 代理地址(domain+port)|
| path | string(string array)| 代理匹配url，支持字符串数组，字符串 |
| headers | object | 自定义header相关，如`cookie, ua` |
| beforeSend | funciton | 请求前处理，参数ctx, options完整转发配置 |


### Example

```javascript
    const Koa = require('koa')
    const app = new Koa()
    const proxy = require('koa-api-proxies')
    /**
     * use config single
     * @type {[type]}
     */
    /**
     * use config multi
     * @type {[type]}
     */
    app.use(proxy([{
      target: 'http://www.google.com',
      path: ['/dist', '/dist2'],
    }, {
      target: 'http://www.yahoo.com',
      path: '/t',
      beforeSend:(ctx, options) => {
      }
    }]))
```
