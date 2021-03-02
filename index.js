require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const session = require("koa-session");
const koaBody = require("koa-body");

const auth = require("./auth");
const subjects = require("./subjects");
const getdb = require("./lib/getdb");
const main = new Router();

const app = new Koa();
const PORT = 8000;

app.keys = [process.env.KEYS];

main.use(session(app)).use(async (ctx, next) => {
    ctx.body = {};
    await next();
}).use(koaBody()).use(getdb.connect);
main.use("/auth", auth.routes(), auth.allowedMethods());
main.use("/subjects", subjects.routes(), subjects.allowedMethods());
//main.use(require("./lib/withAuth"))
main.use(ctx => ctx.body.status = "success");

app.use(main.routes(), main.allowedMethods());
app.on('error', err => console.log('server error', err));
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));