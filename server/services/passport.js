const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    // Verify email and password, call done with the user
    // if it is the correct email and password
    // otherwise, call done with false
    User.findOne({email: email}, function(err, user){
        if(err) {return done(err);}

        if(!user) {return done(null, false);}

        // compare passwords- is password equal to user.password
        user.comparePassword(password, function(err, isMatch) {
            if(err) {return done(err);}
            if(!isMatch) {return done(null, false); }
            return done(null, user);
        });
    });
});

const User = require('../models/user');
const config = require('../config');

// Set up options for JWT Strategy
const jwtOptions = {
    jwtFromRequest : ExtractJwt.fromHeader('authorization'),
    secretOrKey    : config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    // See if the user id in the payload exists in out database
    // if it does call done with that user
    // otherwise call done without a user object
    User.findById(payload.sub, function(err, user) {
        if(err) {return done(err, false); }

        if(user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);