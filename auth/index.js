const Router = require("koa-router");
const auth = new Router();

const user = require('./user');

auth.post("/register", user.register).patch("/register", user.changeinfo);
auth.use("/user", user.common).get("/user", user.get).post("/user", user.changepw).delete("/user", user.delete).patch("/user", user.patch);

module.exports = auth;