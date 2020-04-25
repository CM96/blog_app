const mongoose=require('mongoose');
const Schema = mongoose.Schema;

let userSchema=new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    blogs:[{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }]
});
const User=mongoose.model("User", userSchema);
module.exports=User;