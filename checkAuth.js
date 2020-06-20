const User = require('./models/user');
const Blog = require('./models/blog');
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
    },
    // MAKING SURE USER CREATED THE BLOG TO MODIFY IT
    ownerShipTest:function ( req, res, next){
        Blog.findOne({_id:req.params.id}, (err, blog)=>{
            if(err){
                console.log(`Something went wrong ${err}`);
            }
            else{
                if(blog.author.username === req.user.username){
                    next();
                }
                else{
                    console.log('SORRY, PERMISSION DENIED');
                    res.redirect('back');
                }
            }
        })
    }
}