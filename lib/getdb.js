const { MongoClient } = require("mongodb");
let client = null;

module.exports = {
    connect: async (ctx, next) => {
        if(!client || !client.isConnected()) {
            client = await MongoClient.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true });
            console.log("Database Connected");
        }
        ctx.state.client = client;
        const userdb = client.db("User");
        const subjectdb = client.db("Subject");
        ctx.state.collection = {};
        ctx.state.collection.users = userdb.collection("users");
        ctx.state.collection.subjects = subjectdb.collection("subjects");
        ctx.state.collection.classes = subjectdb.collection("classes");
        await next();
    }
}