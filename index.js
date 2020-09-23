require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const session = require("koa-session");

const auth = require("./auth");
const subjects = require("./subjects");
const main = new Router();

const app = new Koa();
const PORT = 8000;

app.keys = [process.env.KEYS];

main.use("/auth", auth.routes(), auth.allowedMethods());
main.use("/subjects", subjects.routes(), subjects.allowedMethods());

app.use(session(app)).use(main.routes()).use(main.allowedMethods());

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));