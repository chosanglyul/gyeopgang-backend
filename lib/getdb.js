const { MongoClient } = require("mongodb");

module.exports = async (ctx, next) => {
    ctx.state.client = await MongoClient.connect(process.env.DB_CONNECTION_STRING);
    ctx.state.db = ctx.state.client.db("pebble-db");
    ctx.state.collection = {};
    ctx.state.collection.users = ctx.state.db.collection("users");
    ctx.state.collection.subjects = ctx.state.db.collection("subjects");
    await next();
}