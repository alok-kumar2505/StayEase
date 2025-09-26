const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

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


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


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
