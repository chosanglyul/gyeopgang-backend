const data = require('./data');
const isNumber = require("../lib/isNumber");
const bcrypt = require("bcrypt");

class user extends data {
    constructor(collection, code) {
        super(collection);
        if(!isNumber(code) || code <= 0) throw 400;
        this.code = parseInt(code, 10);
    }

    getDict() { return { code: this.code }; }

    async newData(info) {
        if(await this.checkExist()) throw 400;
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

    async comparePW(password) {
        try {
            await this.pullData();
            return await bcrypt.compare(password, this.info.password);
        } catch { throw e; }
    }

    async addSubject(newsubject, newclass) {
        try {
            await this.pullData();
            if(this.info.subjects.indexOf(newsubject) != -1) throw 400;
            this.info.subjects.push(newsubject);
            this.info.classes.push(newclass);
            await this.changeData({ subjects: this.info.subjects, classes: this.info.classes });
        } catch { throw e; }
    }

    async delSubject(delsubject, delclass) {
        try {
            await this.pullData();
            const idx = this.info.subjects.indexOf(delsubject);
            if(idx == -1 || this.info.classes[idx] != delclass) throw 400;
            this.info.subjects.splice(idx, 1);
            this.info.classes.splice(idx, 1);
            await this.changeData({ subjects: this.info.subjects, classes: this.info.classes });
        } catch { throw e; }
    }
}

module.exports = user;