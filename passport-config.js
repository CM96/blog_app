const passport    = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      flash         = require ('connect-flash'),
      bcrypt        = require ('bcryptjs'),
      User        = require ('./models/user');

module.exports=function (passport){
    //reference: passportjs(documentation) local Strategy configure
    passport.use(new LocalStrategy({usernameField:'username'}, (username,password, done)=>{

        //finding user with entered password and username
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }
            //bcrypt compare: verifying password
            bcrypt.compare(password,user.password, function(err, res) {
                if(err) 
                    return err;
                if(res)
                    return done(null, user);
                else{
                    return done(null, false, { message: 'Password incorrect' });
                }

            });
          });
    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}