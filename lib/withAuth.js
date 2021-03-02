const excludepath = ['/auth/login'];
const exp = () => {
    var withAuth = async (ctx, next) => {
        if(!(excludepath.includes(ctx.request.path) || ctx.isAuthenticated())) ctx.throw(401);
        await next();
    }
    withAuth.unless = require('koa-unless');
    return withAuth;
}

module.exports = exp();