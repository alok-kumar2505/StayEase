if (process. env.NODE_ENV != "production") {
    require("dotenv"). config();
}
// require("dotenv").config();


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/StayEase";  //local db

const dbUrl=process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to MongoDB Atlas");
})
    .catch((err) => {
        process.exit(1);
    });

async function main() {
    await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        retryWrites: true,
        w: "majority"
    });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); //for using same code boilerplate in diiferent pages
app.use(express.static(path.join(__dirname, "/public"))); //path set for public css 




app.get("/", (req, res) => {
    res.redirect("/listings");
});

const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{secret:process.env.SECRET},
    touchAfter:24*3600,

});

store.on("error", () =>{
console. log ("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expire:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//if above all routed not match this * matches and throw expresserror to middleware
app.use("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
})

app.use((err, req, res, next) => {
     console.error("🔥 ERROR DETAILS:", err); 
    let { statusCode = 500, message = "Something went Wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message })
})

app.listen(8080, () => {
    console.log("Server is listening");
});
