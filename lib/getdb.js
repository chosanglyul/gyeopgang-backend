const { MongoClient } = require("mongodb");

module.exports = async (ctx, next) => {
    const url = `mongodb+srv://${process.env.PEBBLE_DB_USER}:${process.env.PEBBLE_DB_PW}@sshs-pebble-wybih.gcp.mongodb.net/test?retryWrites=true&w=majority`;
    ctx.state.client = await MongoClient.connect(url);
    ctx.state.db = ctx.state.client.db("pebble-db");
    ctx.state.collection = {};
    ctx.state.collection.users = ctx.state.db.collection("users_G");
    ctx.state.collection.subjects = ctx.state.db.collection("subjects_G");
    await next();
}