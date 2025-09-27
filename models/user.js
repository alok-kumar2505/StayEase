const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

let userSchema= new Schema({
    email:{
        type:String,
        required:true,
    }

});

userSchema.plugin(passportLocalMongoose); //its automatically implement hashing,salting,ad username ,password to our models that why we use use.plugin

module.exports=mongoose.model("User",userSchema);
