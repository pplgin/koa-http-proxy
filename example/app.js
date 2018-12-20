const Koa = require('koa');
const app = new Koa();
const proxy = require('../index');

/**
 * use config multi
 * @type {[type]}
 */
app.use(proxy([{
  target: 'http://www.google.com',
  path: '/dist',
}, {
  target: 'http://www.yahoo.com',
  path: ['/t', '/m'],
}]))



// x-response-time

app.use(async function(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async function(ctx, next) {
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