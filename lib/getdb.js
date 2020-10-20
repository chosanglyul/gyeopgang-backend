const { MongoClient } = require("mongodb");

module.exports = {
    connect: async (ctx, next) => {
        const client = await MongoClient.connect(process.env.DB_CONNECTION_STRING);
        const userdb = client.db("User");
        const subjectdb = client.db("Subject");
        ctx.state.collection = {};
        ctx.state.collection.users = userdb.collection("users");
        ctx.state.collection.subjects = subjectdb.collection("subjects");
        ctx.state.collection.classes = subjectdb.collection("classes");
        await next();
    },
    close: async (ctx, next) => {
        await ctx.state.client.close();
        await next();
    }
}