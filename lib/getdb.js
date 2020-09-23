const { MongoClient } = require("mongodb");

module.exports = async (ctx, next) => {
    ctx.state.client = await MongoClient.connect(process.env.DB_CONNECTION_STRING);
    ctx.state.db = ctx.state.client.db("pebble-db");
    ctx.state.collection = {};
    ctx.state.collection.users = ctx.state.db.collection("users");
    ctx.state.collection.subjects = ctx.state.db.collection("subjects");
    ctx.state.collection.classes = ctx.state.db.collection("classes");
    await next();
}