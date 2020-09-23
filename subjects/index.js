const Router = require("koa-router");
const subjects = new Router();

const subject = require("./subject");
const classes = require("./classes");

subjects.use("/subject/:code", subject.common).get("/subject/:code", subject.get).post("/subject/:code", subject.post).delete("/subject/:code", subject.delete);
subjects.use("/subject/:code/:classnum", classes.common).get("/subject/:code/:classnum", classes.get).post("/subject/:code/:classnum", classes.post).delete("/subject/:code/:classnum", classes.delete);

module.exports = subjects;