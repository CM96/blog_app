const express     =  require("express"),
      app         =  express(),
      bodyParser  =  require("body-parser"),
      mongoose    =  require("mongoose");
      methodOverride=require("method-override");
      expressSanitizer=require("express-sanitizer");

mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


var blogSchema=new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date, default:Date.now}
});
var Blog=mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES
app.get("/", (req,res)=>{
    res.redirect("/blogs");
});
app.get("/blogs", (req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err) {
            console.log(err);
        }else{
            res.render("index" ,{blogs:blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", (req,res)=>{
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req,res)=>{
    //create blog
    req.body.blog.body =req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,(err,newblog)=>{
        if(err) {
            res.render("new");
        }else{
            //redirect to the index
            res.redirect("/blogs");
        }
    });
});
app.get("/blogs/:id", (req,res)=>{
   Blog.findById(req.params.id, (err,foundBlog)=>{
        if(err) {
            res.redirect("/blogs");
        }else{
            //redirect to the index
            res.render("show", {blog:foundBlog});
        }
   });
});
//EDIT ROUTE
app.get("/blogs/:id/edit", (req,res)=>{
    Blog.findById(req.params.id, (err,foundBlog)=>{
         if(err) {
             res.redirect("/blogs");
         }else{
             //redirect to the index
             res.render("edit", {blog: foundBlog});
         }
    });
 });

 //UPDATE ROUTE

 app.put("/blogs/:id", (req,res)=>{
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

app.delete("/blogs/:id", (req,res)=>{
    Blog.findByIdAndRemove(req.params.id, (err,foundBlog)=>{
         if(err) {
             res.redirect("/blogs");
         }else{
             //redirect to the index
             res.redirect("/blogs");
         }
    });
 });

//server listening
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server is running ");
});