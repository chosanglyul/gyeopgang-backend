class data {
    constructor(collection) {
        this.collection = collection;
    }

    getDict() { return {}; } //HAVE TO OVERRIDE!

    async newData() {} //HAVE TO OVERRIDE!

    async checkExist() {
        const isExist = await this.collection.countDocuments(this.getDict());
        return isExist > 0;
    }

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
            await this.pullData();
            await this.collection.deleteOne(this.getDict());
        } catch(e) { throw e; }
    }

    async changeData(info) {
        if(!(await this.checkExist())) throw 400;
        await this.collection.findOneAndUpdate(this.getDict(), { $set: info });
        await this.pullData();
    }
}

module.exports = data;