const Router = require("koa-router");
const subjects = new Router();

const subject = require("./subject");

subjects.use("/subject/:code", subject.common).get("/subject/:code", subject.get).post("/subject/:code", subject.post).delete("/subject/:code", subject.delete);

module.exports = subjects;