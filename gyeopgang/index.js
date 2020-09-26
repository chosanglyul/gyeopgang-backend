const Router = require("koa-router");
const gyeopgang = new Router();

gyeopgang.get("/", require("./findmax")).get("/:code", require("./cmpuser"));

module.exports = gyeopgang;