const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing= require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});  

async function main (){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate); //for using same code boilerplate in diiferent pages
app.use(express.static(path.join(__dirname,"/public"))); //path set for public css 

app.get("/",(req,res)=>{
    res.send("root is working");
})


//index route
 app.get("/listings",async(req,res)=>{
   
        const allListings= await Listing.find({});
        res.render("listings/index.ejs",{allListings});
 })

 //new
 app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// /show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params; 
    const listing =  await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//create rooute
app.post("/listing",async(req,res)=>{
    // let {titlle,description,image,price,country,location}=req.body;
    const newListing= new Listing(req.body.listing);
   await newListing.save();
    res.redirect("/listings");
})

// edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//update route
app.put("/listings/:id",async(req,res)=>{ 
    let {id}=req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
})

//Delete route
app.delete("/listings/:id", async(req,res)=>{
    let {id}=req.params;
    let deletedval=await Listing.findByIdAndDelete(id);
    console.log(deletedval);
    res.redirect("/listings");

})

// app.get("/testListing",async( req,res)=>{
//     let sampleListing= new Listing({
//         title:"Alok",
//         description:"By the beach",
//         price:1200,
//         location:"Bihar",
//         country:"India",
//     })

//     await sampleListing.save();
//     console.log("sample saved");
//     res.send("sample success");


// })

app.listen(8080,()=>{
    console.log("Server is listening");
});
