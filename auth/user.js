const bcrypt = require("bcrypt");
const user = require("../lib/user");
const Ajv = require('ajv');
const ajv = new Ajv();
const schema = {
    "type": "object",
    "properties": {
        "action": { "type": "string" }, // add or del
        "subject": { "type": "integer" },
        "class": { "type": "integer" }
    },
    "required": ["action", "subject", "class"]
};

module.exports = {
    register: async(ctx, next) => {
        try {
            const userclass = new user(ctx.state.collection.users, ctx.request.body.code);
            await userclass.newData(ctx.request.body);
        } catch(e) { ctx.throw(e); }
        await next();
    },
    changeinfo: async(ctx, next) => {
        await next();
    },
    get: async(ctx, next) => {
        try {
            ctx.body.data = await ctx.state.userclass.getData();
            ctx.body.data.password = null;
        } catch(e) { ctx.throw(e); }
        await next();
    },
    delete: async(ctx, next) => {
        try { await ctx.state.userclass.deleteData(); }
        catch(e) { ctx.throw(e); }
        await next();
    },
    patch: async(ctx, next) => {
        if(!ctx.request.body.changes) ctx.throw(400);
        const isValid = ajv.validate(schema, ctx.request.body.changes);
        if(!isValid) {
            console.log(`Validation Error. ${ajv.errorsText()}`);
            ctx.throw(400);
        }
        try {
            const addUsercode = await ctx.state.userclass.getData().code;
            const addClass = await ctx.state.collection.classes.findOne({ subjectcode: ctx.request.body.changes.subject, classnum: ctx.request.body.changes.class });
            if(ctx.request.body.changes.action == 'add') {
                await ctx.state.userclass.addSubject(ctx.request.body.changes.subject, ctx.request.body.changes.class);
                addClass.students.push(addUsercode);
            } else if(ctx.request.body.changes.action == 'del') {
                await ctx.state.userclass.delSubject(ctx.request.body.changes.subject, ctx.request.body.changes.class);
                addClass.students.splice(addClass.students.indexOf(addUsercode), 1);
            } else ctx.throw(400);
            await ctx.state.collection.classes.findOneAndUpdate({ subjectcode: addClass.subjectcode, classnum: addClass.classnum }, { $set: { students: addClass.students } });
        } catch(e) { throw e; }
        /*
        const thisuser = await ctx.state.userclass.getData();
        const changes = ctx.request.body.changes;
        const add_class = await Promise.all(changes.add.subjects.map((subjectcode, idx) => ctx.state.collection.classes.findOne({ subjectcode: subjectcode, classnum: changes.add.classes[idx] })));
        const chkadd_exist = changes.add.subjects.map(subjectcode => thisuser.subjects.indexOf(subjectcode));
        const chkdel_sub = changes.del.subjects.map(subjectcode => thisuser.subjects.indexOf(subjectcode));
        if(add_class.some(e => !e) || chkdel_sub.includes(-1) || chkadd_exist.some(e => e != -1)) ctx.throw(400);

        chkdel_sub.sort().reverse().forEach(idx => {
            thisuser.subjects.splice(idx, 1);
            thisuser.classes.splice(idx, 1);
        });
        thisuser.subjects = thisuser.subjects.concat(changes.add.subjects);
        thisuser.classes = thisuser.classes.concat(changes.add.classes);
        await ctx.state.collection.users.findOneAndUpdate({ code: thisuser.code }, { $set: { subjects: thisuser.subjects, classes: thisuser.classes } });
        await Promise.all(add_class.map(val => {
            val.students.push(thisuser.code);
            ctx.state.collection.classes.findOneAndUpdate({ subjectcode: val.subjectcode, classnum: val.classnum }, { $set: { students: val.students } });
        }));
        */
        await next();
    },
    changepw: async(ctx, next) => {
        if(!ctx.request.body.oldpassword || !ctx.request.body.password) ctx.throw(400);
        if(!(await ctx.state.userclass.comparePW(ctx.request.body.oldpassword))) ctx.throw(400);
        await ctx.state.userclass.changeData({ password: await bcrypt.hash(ctx.request.body.password, 10) });
        await next();
    },
    common: async(ctx, next) => {
        try {
            var code = 0;
            if(ctx.method == 'GET' && ctx.request.query.code) code = ctx.request.query.code;
            else if(!ctx.isUnauthenticated()) code = ctx.session.passport.user.code;
            else ctx.throw(400);
            ctx.state.userclass = new user(ctx.state.collection.users, code);
        } catch(e) { ctx.throw(e); }
        await next();
    }
};