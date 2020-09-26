const Router = require("koa-router");
const passport = require("koa-passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const isNumber = require("../lib/isNumber");
const auth = new Router();

const user = require('./user');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use('local', new LocalStrategy({
    usernameField: 'code',
    passwordField: 'password',
    passReqToCallback: true
}, async ({ ctx }, code, password, done) => {
    if(!isNumber(code, "4")) return done(null, false);
    const user = await ctx.state.collection.users.findOne({ code: parseInt(code, 10) });
    if(!user) return done(null, false);
    if(bcrypt.compare(password, user.password)) return done(null, false);
    return done(null, user);
}));

auth.use(passport.initialize(), passport.session());

auth.post("/login", passport.authenticate('local'));
auth.post("/logout", async (ctx, next) => {
    await ctx.logout();
    await next();
});

auth.use("/user/:code", user.common).get("/user/:code", user.get).post("/user/:code", user.post).delete("/user/:code", user.delete);
auth.post("/changepw/:code", user.changepw);

module.exports = auth;