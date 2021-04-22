const data = require('./data');
const isNumber = require("../lib/isNumber");

class subject extends data {
    constructor(collection, code) {
        super(collection);
        if(!isNumber(code) || code <= 0) throw 400;
        this.code = parseInt(code, 10);
    }

    getDict() { return { code: this.code }; }

    async newData(info) {
        if(await this.checkExist()) throw 400;
        if(!info.name || !isNumber(info.hours) || info.hours <= 0 || !isNumber(info.credit) || info.credit <= 0) throw 400;

        await this.collection.findOneAndUpdate(this.getDict(), {
            $setOnInsert: {
                name: info.name,
                hours: parseInt(info.hours, 10),
                credit: parseInt(info.credit, 10),
                classes: 0
            }
        }, { upsert: true });
    }
}

module.exports = subject;