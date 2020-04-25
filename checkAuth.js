module.exports={
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        return res.redirect('/login');
    },
    noReturn: function( req, res, next){
        if(req.isAuthenticated()){
            return res.redirect('/login');
        }
        return next();
    }
}