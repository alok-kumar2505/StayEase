const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// /show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//create rooute
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    // let {titlle,description,image,price,country,location}=req.body;
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {

    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedval = await Listing.findByIdAndDelete(id);
    console.log(deletedval);
    res.redirect("/listings");

}));

module.exports=router;