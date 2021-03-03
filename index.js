require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const session = require("koa-session");
const koaBody = require("koa-body");
const cors = require("@koa/cors");

const auth = require("./auth");
const pass = require("./auth/passport");
const subjects = require("./subjects");
const getdb = require("./lib/getdb");
const withAuth = require("./lib/withAuth");
const main = new Router();

const app = new Koa();
const PORT = 8000;

app.keys = [process.env.KEYS];

main.use(cors({
    origin: true,
    credentials: true
})).use(session(app)).use(async (ctx, next) => {
    ctx.body = {};
    await next();
}).use(koaBody());
main.use(getdb.connect);
main.use("/auth", pass.routes(), pass.allowedMethods());
//main.use(withAuth.unless({ path: ['/', '/auth/login', '/auth/logout'] }));
main.use("/auth", auth.routes(), auth.allowedMethods());
main.use("/subjects", subjects.routes(), subjects.allowedMethods());
main.use(ctx => ctx.body.status = "success");

app.use(main.routes(), main.allowedMethods());
app.on('error', err => console.log('Request Error', err));
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));