module.exports = async (ctx, next) => {
    const user = await ctx.state.collection.users.findOne({ code: parseInt(ctx.params.code, 10) });
    if(!user) ctx.throw(400);
    subjects = []
    classes = []
    ctx.session.passport.user.subjects.forEach((subject, idx) => {
        const cmp = user.subjects.indexOf(subject);
        if(cmp !== -1 && user.classes[cmp] === ctx.session.passport.user.classes[idx]) {
            subjects.push(ctx.session.passport.user.subjects[idx]);
            classes.push(ctx.session.passport.user.classes[idx]);
        }
    });
    ctx.body.data = {
        "subjects": subjects,
        "classes": classes
    }
    await next();
};