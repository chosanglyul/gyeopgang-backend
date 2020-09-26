const Router = require("koa-router");
const subjects = new Router();

const subject = require("./subject");
const classes = require("./classes");

subjects.use("/subject/:code", subject.common).get("/subject/:code", subject.get).post("/subject/:code", subject.post).delete("/subject/:code", subject.delete);
subjects.use("/subject/:subjectcode/:classnum", classes.common).get("/subject/:subjectcode/:classnum", classes.get).post("/subject/:subjectcode/:classnum", classes.post).delete("/subject/:subjectcode/:classnum", classes.delete).patch("/subject/:subjectcode/:classnum", classes.patch);

module.exports = subjects;