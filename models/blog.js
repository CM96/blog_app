const mongoose=require('mongoose');
const Schema = mongoose.Schema;

let blogSchema=new Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date, default:Date.now}
});
const Blog=mongoose.model("Blog", blogSchema);
module.exports=Blog;