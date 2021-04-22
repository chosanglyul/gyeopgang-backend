const exp = () => {
    var withAuth = async (ctx, next) => {
        if(ctx.isUnauthenticated()) ctx.throw(401);
        await next();
    }
    withAuth.unless = require('koa-unless');
    return withAuth;
}

module.exports = exp();