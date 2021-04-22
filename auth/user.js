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

class data {
    constructor(collection) {
        this.collection = collection;
    }

    getDict() { return {}; } //HAVE TO OVERRIDE!

    async newData() {} //HAVE TO OVERRIDE!

    async pullData() {
        if(!this.info) {
            const user = await this.collection.findOne(this.getDict());
            if(user) this.info = user;
            else throw 400;
        }
    }

    async getData() {
        try {
            await this.pullData();
            return this.info;
        } catch(e) { throw e; }
    }

    async deleteData() {
        try {
            this.pullData();
            await this.collection.deleteOne(this.getDict());
        } catch(e) { throw e; }
    }

    async changeData(info) {
        const isExist = await this.collection.countDocuments(this.getDict());
        if(!isExist) throw 400;

        await this.collection.findOneAndUpdate(this.getDict(), { $set: info });
    }
}

class user extends data {
    constructor(collection, code) {
        super(collection);
        if(!isNumber(code) || code <= 0) throw 400;
        this.code = parseInt(code, 10);
    }

    getDict() { return { code: this.code }; }

    async newData(info) {
        const isExist = await this.collection.countDocuments(this.getDict());
        if(isExist >= 1) throw 400;
        if(!info.name || !info.password || !isNumber(info.grade) || !isNumber(info.class) || !isNumber(info.number)) throw 400;
        if(info.grade > 3 || info.grade <= 0 || info.class <= 0 || info.number <= 0) throw 400;

        await this.collection.findOneAndUpdate(this.getDict(), {
            $setOnInsert: {
                name: info.name,
                grade: parseInt(info.grade, 10),
                class: parseInt(info.class, 10),
                number: parseInt(info.number, 10),
                password: await bcrypt.hash(info.password, 10),
                subjects: [],
                classes: []
            }
        }, { upsert: true });
    }
}

class subject extends data {
    constructor(collection, code) {
        super(collection);
        if(!isNumber(code) || code <= 0) throw 400;
        this.code = parseInt(code, 10);
    }

    getDict() { return { code: this.code }; }

    async newData(info) {
        const isExist = await this.collection.countDocuments(this.getDict());
        if(isExist >= 1) throw 400;
        if(!info.name || !info.password || !isNumber(info.grade) || !isNumber(info.class) || !isNumber(info.number)) throw 400;
        if(info.grade > 3 || info.grade <= 0 || info.class <= 0 || info.number <= 0) throw 400;

        await this.collection.findOneAndUpdate(this.getDict(), {
            $setOnInsert: {
                name: info.name,
                grade: parseInt(info.grade, 10),
                class: parseInt(info.class, 10),
                number: parseInt(info.number, 10),
                password: await bcrypt.hash(info.password, 10),
                subjects: [],
                classes: []
            }
        }, { upsert: true });
    }
}

module.exports = {
    register: async(ctx, next) => {
        try {
            const userclass = new user(ctx.state.collection.users, ctx.request.body.code);
            await userclass.newData(ctx.request.body);
        } catch(e) { ctx.throw(e); }
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
        await next();
    },
    changepw: async(ctx, next) => {
        if(!ctx.request.body.oldpassword || !ctx.request.body.password) ctx.throw(400);
        const userinfo = await ctx.state.userclass.getData();
        console.log(userinfo);
        if(!bcrypt.compare(ctx.request.body.oldpassword, userinfo.password)) ctx.throw(400);
        await ctx.state.userclass.changeData({ password: await bcrypt.hash(ctx.request.body.password, 10) });
        await next();
    },
    common: async(ctx, next) => {
        try {
            var code = 0;
            console.log(ctx.cookies.get('koa.sess'));
            console.log(ctx.isAuthenticated(), ctx.isUnauthenticated());
            if(ctx.method == 'GET' && ctx.request.query.code) code = ctx.request.query.code;
            else if(!ctx.isUnauthenticated()) code = ctx.session.passport.user.code;
            else ctx.throw(400);
            ctx.state.userclass = new user(ctx.state.collection.users, code);
        } catch(e) { ctx.throw(e); }
        await next();
    }
};