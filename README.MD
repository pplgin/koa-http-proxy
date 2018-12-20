## koa-api-proxies

> koa2 http proxy middleware

###　Suport

> post、get、put、delete； file upload

###　Use ：

```
npm install koa-api-proxies
```

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
      match: ['/dist', '/dist2'],
    }, {
      target: 'http://www.yahoo.com',
      match: '/t',
      beforeSend:(ctx, options) => {
      }
    }]))
```
