const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
})
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); //for using same code boilerplate in diiferent pages
app.use(express.static(path.join(__dirname, "/public"))); //path set for public css 

app.get("/", (req, res) => {
    res.send("root is working");
})

const validateListing=(req,res,next)=>{
let {error}=listingSchema.validate(req.body);

if(error){
    let errmsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,error);
}else{
    next();
}
}

//index route
app.get("/listings",wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// /show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//create rooute
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    // let {titlle,description,image,price,country,location}=req.body;
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
app.put("/listings/:id", validateListing,wrapAsync(async (req, res) => {
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedval = await Listing.findByIdAndDelete(id);
    console.log(deletedval);
    res.redirect("/listings");

}));

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

//if above all routed not match this * matches and throw expresserror to middleware
app.use("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went Wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message })
})

app.listen(8080, () => {
    console.log("Server is listening");
});
