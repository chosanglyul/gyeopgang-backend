const bcrypt = require("bcrypt");
const isNumber = require("../lib/isNumber");

module.exports = {
    post: async(ctx, next) => {
        if(!ctx.request.body.email || !ctx.request.body.name || !ctx.request.body.password || !ctx.request.body.phone) ctx.throw(400);
        if(!isNumber(ctx.request.body.grade) || !isNumber(ctx.request.body.class) || !isNumber(ctx.request.body.number)) ctx.throw(400);
        if(ctx.request.body.grade > 3 || ctx.request.body.grade <= 0 || ctx.request.body.class <= 0 || ctx.request.body.number <= 0) ctx.throw(400);
        const isExist = await ctx.state.collection.users.countDocuments({ code: parseInt(ctx.params.code, 10)});
        if(isExist >= 1) ctx.throw(400);
        await ctx.state.collection.users.findOneAndUpdate({ code: parseInt(ctx.params.code, 10) }, {
            $setOnInsert: {
                name: ctx.request.body.name,
                grade: parseInt(ctx.request.body.grade, 10),
                class: parseInt(ctx.request.body.class, 10),
                number: parseInt(ctx.request.body.number, 10),
                password: await bcrypt.hash(ctx.request.body.password, 10)
            }
        }, { upsert: true });
        await next();
    },
    get: async(ctx, next) => {
        var user = await ctx.state.collection.users.findOne({ code: parseInt(ctx.params.code, 10) });
        if(!user) ctx.throw(400);
        user.password = null;
        ctx.body.data = user;
        await next();
    },
    delete: async(ctx, next) => {
        const isExist = await ctx.state.collection.users.countDocuments({ code: parseInt(ctx.params.code, 10)});
        if(!isExist) ctx.throw(400);
        await ctx.state.collection.users.deleteOne({ code: parseInt(ctx.params.code, 10) });
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.code, "4") || ctx.params.code < 0) ctx.throw(400);
        await next();
    }
};