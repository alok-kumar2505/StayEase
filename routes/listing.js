const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

//index route
router.get("/", wrapAsync(listingController.index));

//new
router.get("/new", isLoggedIn, listingController.renderNewForm);

// /show route
router.get("/:id", wrapAsync(listingController.showListing));

//create rooute
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListings)
);

// edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);

//Delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteRoute)
);

module.exports = router;
