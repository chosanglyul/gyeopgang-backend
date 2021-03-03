const Router = require("koa-router");
const auth = new Router();

const user = require('./user');

auth.use("/user/:code", user.common).get("/user/:code", user.get).post("/user/:code", user.post).delete("/user/:code", user.delete).patch("/user/:code", user.patch);
auth.post("/changepw/:code", user.changepw);

module.exports = auth;