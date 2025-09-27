const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapasync=require("../utils/WrapAsync.js");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",wrapasync( async(req,res)=>{
    let {username,email,password}=req.body;
    const newUser=new User({username,email});
   let  registeredUser= await User.register(newUser,password);
   console.log(registeredUser);
   req.flash("success","Welcome to Wanderlust");
   res.redirect("/listings");
}));

module.exports=router;
