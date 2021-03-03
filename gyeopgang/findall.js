module.exports = async (ctx, next) => {
    const userclasses = await Promise.all(ctx.session.passport.user.classes.map((val, idx) => ctx.state.collection.classes.findOne({ subjectcode: ctx.session.passport.user.subjects[idx], classnum: val })));
    const counts = {};
    userclasses.forEach(val => {
        val.students.forEach(student => {
            if(student in counts) counts[student] += 1;
            else counts[student] = 1;
        });
    });
    ctx.body.data = { "result": counts };
    await next();
};