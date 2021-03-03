const Router = require("koa-router");
const subjects = new Router();

const subject = require("./subject");
const classes = require("./classes");

subjects.post("/", subject.postindex).post("/", subject.post).get("/", subject.getindex);
subjects.use("/:code", subject.common).get("/:code", subject.get).post("/:code", subject.post).delete("/:code", subject.delete);
subjects.use("/:subjectcode/:classnum", classes.common).get("/:subjectcode/:classnum", classes.get).post("/:subjectcode/:classnum", classes.post).delete("/:subjectcode/:classnum", classes.delete).patch("/:subjectcode/:classnum", classes.patch);

module.exports = subjects;