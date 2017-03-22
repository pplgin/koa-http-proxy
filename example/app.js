const Koa = require('koa');
const app = new Koa();
const proxy = require('../index');

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



// x-response-time

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3030);