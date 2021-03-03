const bcrypt = require("bcrypt");
const isNumber = require("../lib/isNumber");
const Ajv = require('ajv');
const ajv = new Ajv();
const adddelproperty = {
    "type": "object",
    "subjects": {
        "type": "array",
        "items": [{"type": "integer"}]
    },
    "classes": {
        "type": "array",
        "items": [{"type": "integer"}]
    },
    "required": ["subjects", "classes"]
}
const schema = {
    "type": "object",
    "properties": {
        "add": adddelproperty,
        "del": adddelproperty
    },
    "required": ["add", "del"]
};

module.exports = {
    post: async(ctx, next) => {
        if(!ctx.request.body.name || !ctx.request.body.password) ctx.throw(400);
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
                password: await bcrypt.hash(ctx.request.body.password, 10),
                subjects: [],
                classes: []
            }
        }, { upsert: true });
        await next();
    },
    get: async(ctx, next) => {
        var user = await ctx.state.collection.users.findOne({ code: parseInt(ctx.params.code, 10) });
        if(!user) ctx.throw(400);
        user.password = null;
        user.classes = await Promise.all(user.classes.map((val, idx) => ctx.state.collection.classes.findOne({ subjectcode: user.subjects[idx], classnum: val })));
        user.subjects = await Promise.all(user.subjects.map(val => ctx.state.collection.subjects.findOne({ code: val })));
        ctx.body.data = user;
        await next();
    },
    delete: async(ctx, next) => {
        const isExist = await ctx.state.collection.users.countDocuments({ code: parseInt(ctx.params.code, 10)});
        if(!isExist) ctx.throw(400);
        await ctx.state.collection.users.deleteOne({ code: parseInt(ctx.params.code, 10) });
        await next();
    },
    patch: async(ctx, next) => {
        if(!ctx.request.body.changes) ctx.throw(400);
        const isValid = ajv.validate(schema, ctx.request.body.changes);
        if(!isValid) {
            console.log(`Validation Error. ${ajv.errorsText()}`);
            ctx.throw(400);
        }

        const user = await ctx.state.collection.users.findOne({ code: parseInt(ctx.params.code, 10)});
        if(!user) ctx.throw(400);
        const changes = ctx.request.body.changes;
        const add_class = await Promise.all(changes.add.subjects.map((subjectcode, idx) => ctx.state.collection.classes.findOne({ subjectcode: subjectcode, classnum: changes.add.classes[idx] })));
        const chkadd_exist = changes.add.subjects.map(subjectcode => user.subjects.indexOf(subjectcode));
        const chkdel_sub = changes.del.subjects.map(subjectcode => user.subjects.indexOf(subjectcode));
        if(add_class.some(e => !e) || chkdel_sub.includes(-1) || chkadd_exist.some(e => e != -1)) ctx.throw(400);

        chkdel_sub.sort().reverse().forEach(idx => {
            user.subjects.splice(idx, 1);
            user.classes.splice(idx, 1);
        });
        user.subjects = user.subjects.concat(changes.add.subjects);
        user.classes = user.classes.concat(changes.add.classes);
        await ctx.state.collection.users.findOneAndUpdate({ code: user.code }, { $set: { subjects: user.subjects, classes: user.classes } });
        await Promise.all(add_class.map(val => {
            val.students.push(user.code);
            ctx.state.collection.classes.findOneAndUpdate({ subjectcode: val.subjectcode, classnum: val.classnum }, { $set: { students: val.students } });
        }));
        await next();
    },
    common: async(ctx, next) => {
        if(!isNumber(ctx.params.code, "4") || ctx.params.code < 0) ctx.throw(400);
        await next();
    },
    changepw: async(ctx, next) => {
        if(!isNumber(ctx.params.code, "4") || ctx.params.code < 0 || !ctx.request.body.password) ctx.throw(400);
        await ctx.state.collection.users.fineOneAndUpdate({ code: parseInt(ctx.params.code, 10) }, { $set: { password: await bcrypt.hash(ctx.request.body.password, 10) } });
        await next();
    }
};