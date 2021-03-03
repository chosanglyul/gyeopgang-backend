const isNumber = require("../lib/isNumber");

module.exports = {
    post: async(ctx, next) => {
        if(!ctx.request.body.name) ctx.throw(400);
        if(!isNumber(ctx.request.body.hours, "4") || !isNumber(ctx.request.body.credit, "4")) ctx.throw(400);
        if(ctx.request.body.hours <= 0 || ctx.request.body.credit <= 0) ctx.throw(400);
        const isExist = await ctx.state.collection.subjects.countDocuments({ code: parseInt(ctx.params.code, 10)});
        if(isExist >= 1) ctx.throw(400);
        await ctx.state.collection.subjects.findOneAndUpdate({ code: parseInt(ctx.params.code, 10) }, {
            $setOnInsert: {
                name: ctx.request.body.name,
                hours: parseInt(ctx.request.body.hours, 10),
                credit: parseInt(ctx.request.body.credit, 10),
                classes: 0
            }
        }, { upsert: true });
        await next();
    },
    get: async(ctx, next) => {
        const subject = await ctx.state.collection.subjects.findOne({ code: parseInt(ctx.params.code, 10) });
        if(!subject) ctx.throw(400);
        ctx.body.data = subject;
        await next();
    },
    delete: async(ctx, next) => {
        const isExist = await ctx.state.collection.subjects.countDocuments({ code: parseInt(ctx.params.code, 10)});
        if(!isExist) ctx.throw(400);
        await ctx.state.collection.subjects.deleteOne({ code: parseInt(ctx.params.code, 10) });
        await ctx.state.collection.classes.deleteMany({ subjectcode: parseInt(ctx.params.code, 10) });
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.code, "4") || ctx.params.code <= 0) ctx.throw(400);
        await next();
    },
    postindex: async(ctx, next) => {
        const count = await ctx.state.collection.subjects.countDocuments();
        ctx.params.code = count+1;
        await next();
    },
    getindex: async(ctx, next) => {
        const count = await ctx.state.collection.subjects.countDocuments();
        ctx.body.data = { "count": count };
        await next();
    }
};