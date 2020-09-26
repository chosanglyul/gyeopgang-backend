const excludepath = ['/auth/login'];

module.exports = async (ctx, next) => {
    if(!(excludepath.includes(ctx.request.path) || ctx.isAuthenticated())) ctx.throw(401);
    await next();
}