const isNumber = require("../lib/isNumber");
const Ajv = require('ajv');
const ajv = new Ajv();
const schema = {
    "type": "object",
    "properties": {
        "add": {
            "type": "array",
            "items": [{"type": "integer"}]
        },
        "del": {
            "type": "array",
            "items": [{"type": "integer"}]
        }
    },
    "additionalProperties": false,
    "required": ["add", "del"]
};

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
    patch: async(ctx, next) => {
        if(!ctx.request.body.changes) ctx.throw(400);
        const isValid = ajv.validate(schema, ctx.request.body.changes);
        if(!isValid) {
            console.log(`Validation Error. ${ajv.errorsText()}`);
            ctx.throw(400);
        }

        const changes = JSON.parse(ctx.request.body.changes);
        if(!Array.isArray(changes.add) || !Array.isArray(changes.del)) ctx.throw(400);
        var tmpclass = await ctx.state.collection.classes.findOne({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        if(!tmpclass) ctx.throw(400);

        const chkadd = changes.add.map(student => {
            if(tmpclass.students.includes(student)) return -1;
            else return 0;
        });
        const chkdel = changes.del.map(student => tmpclass.students.indexOf(student));
        if(chkadd.includes(-1) || chkdel.includes(-1)) ctx.throw(400);
        chkdel.sort().reverse().forEach(idx => tmpclass.students.splice(idx, 1));

        tmpclass.students = tmpclass.students.concat(chkadd);
        await ctx.state.collection.clases.findOneAndUpdate({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) }, { $set: { students: tmpclass.students } });
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.subjectcode, "4") || ctx.params.subjectcode < 0 || !isNumber(ctx.params.classnum, "4") || ctx.params.classnum < 0) ctx.throw(400);
        await next();
    }
};