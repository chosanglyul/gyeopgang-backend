module.exports = async (ctx, next) => {
    if(!isNumber(ctx.params.code, "4") || ctx.params.code < 0) ctx.throw(400);

    await next();  
};