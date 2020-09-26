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
        const changenum = parseInt(ctx.params.classnum, 10);
        const isExist = await ctx.state.collection.classes.countDocuments({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: changenum });
        const subject = await ctx.state.collection.subjects.findOne({ code: parseInt(ctx.params.subjectcode, 10) });
        if(!ctx.request.body.teacher || isExist >= 1 || !subject || subject.classes >= changenum) ctx.throw(400);
        await Promise.all(Array(changenum - subject.classes).fill().map((_, i) => {
            ctx.state.collection.classes.findOneAndUpdate({ subjectcode: subject.code, classnum: i+1+subject.classes }, {
                $setOnInsert: {
                    teacher: ctx.request.body.teacher,
                    students: []
                }
            }, { upsert: true });
        }))
        await ctx.state.collection.subjects.findOneAndUpdate({ code: subject.code }, { $set: { classes: changenum+1 } }); 
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
        const tmpclass = await ctx.state.collection.classes.findOne({ subjectcode: parseInt(ctx.params.subjectcode, 10), classnum: parseInt(ctx.params.classnum, 10) });
        if(!tmpclass) ctx.throw(400);

        const chkadd = changes.add.map(student => {
            if(tmpclass.students.includes(student)) return -1;
            else return 0;
        });
        const chkdel = changes.del.map(student => tmpclass.students.indexOf(student));
        if(chkadd.includes(-1) || chkdel.includes(-1)) ctx.throw(400);
        chkdel.sort().reverse().forEach(idx => tmpclass.students.splice(idx, 1));

        await ctx.state.collection.classes.findOneAndUpdate({ subjectcode: tmpclass.subjectcode, classnum: tmpclass.classnum }, { $set: { students: tmpclass.students.concat(chkadd) } });
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.subjectcode, "4") || ctx.params.subjectcode < 0 || !isNumber(ctx.params.classnum, "4") || ctx.params.classnum <= 0) ctx.throw(400);
        await next();
    }
};