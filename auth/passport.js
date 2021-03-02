const Router = require("koa-router");
const passport = require("koa-passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const isNumber = require("../lib/isNumber");
const pass = new Router();

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
    if(!bcrypt.compare(password, user.password)) return done(null, false);
    return done(null, user);
}));

pass.use(passport.initialize(), passport.session());
pass.post("/login", passport.authenticate('local'));

module.exports = pass;