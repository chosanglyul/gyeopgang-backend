const bcrypt = require("bcrypt");
const isNumber = require("../lib/isNumber");

module.exports = {
    post: async(ctx, next) => {
        if(!ctx.request.body.teacher) ctx.throw(400);
        const isExist = await ctx.state.collection.classes.countDocuments({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        if(isExist >= 1) ctx.throw(400);
        await ctx.state.collection.classes.findOneAndUpdate({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) }, {
            $setOnInsert: {
                teacher: ctx.request.body.teacher,
                students: []
            }
        }, { upsert: true });
        await next();
    },
    get: async(ctx, next) => {
        const tmpclass = await ctx.state.collection.classes.findOne({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        if(!tmpclass) ctx.throw(400);
        ctx.body.data = tmpclass;
        await next();
    },
    delete: async(ctx, next) => {
        const isExist = await ctx.state.collection.classes.countDocuments({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        if(!isExist) ctx.throw(400);
        await ctx.state.collection.classes.deleteOne({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.subjectcode, "4") || ctx.params.subjectcode < 0 || !isNumber(ctx.params.classnum, "4") || ctx.params.classnum < 0) ctx.throw(400);
        await next();
    }
};