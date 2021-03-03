const Router = require("koa-router");
const gyeopgang = new Router();

gyeopgang.get("/all", require("./findall")).get("/compare/:code", require("./cmpuser"));

module.exports = gyeopgang;