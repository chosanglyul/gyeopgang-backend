const { MongoClient } = require("mongodb");

module.exports = {
    connect: async (ctx, next) => {
        ctx.state.client = await MongoClient.connect(process.env.DB_CONNECTION_STRING);
        const userdb = ctx.state.client.db("User");
        const subjectdb = ctx.state.client.db("Subject");
        ctx.state.collection = {};
        ctx.state.collection.users = userdb.collection("users");
        ctx.state.collection.subjects = subjectdb.collection("subjects");
        ctx.state.collection.classes = subjectdb.collection("classes");
        await next();
    }
}