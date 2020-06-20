const express     =  require("express"),
      app         =  express(),
      bodyParser  =  require("body-parser"),
      mongoose    =  require("mongoose"),
      methodOverride=require("method-override"),
      expressSanitizer=require("express-sanitizer"),
      passport    = require('passport'),
      LocalStrategy = require('passport-local'),
      session       = require('express-session'),
      flash         = require ('connect-flash'),
      passportConfig = require ('./passport-config'),
      bcrypt        = require ('bcryptjs'),
      checkAuth    = require('./checkAuth'),
      Blog        = require('./models/blog'),
      User        = require ('./models/user');

mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true , useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());
//INTIALIZING EXPRESS SESSION

app.use(session({
    secret: 'daily dose of happiness',
    saveUninitialized: false,
    resave: false
}));

// passport coming in....has to be after express session
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){ //will be used in every route
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    res.locals.authenticatedUser = req.isAuthenticated();
    next();//important for middlewares!!!
});
passportConfig(passport)

//RESTFUL ROUTES
app.get("/", (req,res)=>{
    res.render("home");
});
app.get("/blogs",(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err) {
            console.log(err);
        }else{
            res.render("index" ,{blogs:blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", checkAuth.isLoggedIn,(req,res)=>{
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs",checkAuth.isLoggedIn, (req,res)=>{
    //create blog
    let newBlog = req.body.blog;
    let blogAuthor={
        id:req.user._id,
        username:req.user.username
    };
    newBlog.author=blogAuthor;
    Blog.create(newBlog,(err,newblog)=>{
        if(err) {
            console.log('SOmething went wrong')
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});
app.get("/blogs/:id", checkAuth.isLoggedIn,(req,res)=>{
   Blog.findById(req.params.id, (err,foundBlog)=>{
        if(err) {
            res.redirect("/blogs");
        }else{
            res.render("show", {blog:foundBlog});
        }
   });
});
//EDIT ROUTE
app.get("/blogs/:id/edit", checkAuth.isLoggedIn, checkAuth.ownerShipTest,(req,res)=>{
    Blog.findById(req.params.id, (err,foundBlog)=>{
         if(err) {
             res.redirect("/blogs");
         }else{
             res.render("edit", {blog: foundBlog});
         }
    });
 });

 //UPDATE ROUTE

 app.put("/blogs/:id", checkAuth.isLoggedIn,(req,res)=>{
    req.body.blog.body =req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err,updatedBlog)=>{
         if(err) {
             res.redirect("/blogs");
         }else{
             res.redirect("/blogs/"+req.params.id);
         }
    });
 });
 //DELETE ROUTE

app.delete("/blogs/:id", checkAuth.isLoggedIn,(req,res)=>{
    Blog.findByIdAndRemove(req.params.id, (err,foundBlog)=>{
         if(err) {
             res.redirect("/blogs");
         }else{
             res.redirect("/blogs");
         }
    });
 });

 //LOGIN ROUTES
 //get: get login page
 app.get('/login',checkAuth.noReturn, (req, res)=>{
     res.render('login');
 });
app.post('/login', passport.authenticate("local",{
    successRedirect:"/blogs",
    failureRedirect:"/login"

}),
(req,res)=>{
    res.render('login');
});
app.get('/logout',checkAuth.isLoggedIn, (req,res)=>{
    req.logOut();
    req.flash('logged out');
    res.redirect('/')
});
 // REGISTER ROUTES
 app.get('/register', (req, res)=>{
    res.render('register');
});
 //post: register user
 app.post('/register', (req, res)=>{
     const {username, email, password, password2}= req.body;
     const errors=[];
      //error checking
    if(!email || !username || !password2 || !password) 
        errors.push('Missing information in some fields');
    if(password !=password2)
        errors.push('password do not match');
    if(password.length< 6)
        errors.push('password too short');
    if(errors.length!=0){
        //get out and redirect
        console.log(errors);
        res.redirect('/register');
    }
    //otherwise check if user exists
    else{
        User.findOne({email:email})
        .then(user=>{
            if(user) {
                console.log('user exists');//check if there is a user in the db with that email
            }
            let newUser=new User({
                username,
                email,
                password,
                password2
            });
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    if(err) console.log(err);
                    // Store hash in your password DB.
                    newUser.password=hash;
                    //insert user in database
                    newUser.save()
                    .then(user=>{
                        //redirect to login page so user could login
                        res.redirect('/login');
                    })
                    .catch(err=>console.log(err))
                });
            });
           
        })
        .catch(err=>console.log(err));//error tr
    // res.redirect('/login');
    }
});
//server listening

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server is running ");
});