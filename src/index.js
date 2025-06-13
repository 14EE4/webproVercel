const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const threadsRouter = require('./api/threads');

const app = new Koa();

app.use(bodyParser());
app.use(threadsRouter.routes());
app.use(threadsRouter.allowedMethods());
app.use(serve(__dirname + '/public'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});