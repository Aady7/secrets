require('dotenv').config()
var md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const { stringify } = require("querystring");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { userInfo } = require('os');
const dbURL = 'mongodb://127.0.0.1:27017/userDB'

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: "I will crack gcoc2024",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

setTimeout(() => {
    mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log('Connected to the database!');
        })
        .catch((err) => {
            console.error('Error connecting to the database:', err);
        });
}, 5000); // Wait 5 seconds before connecting


const userSchema = new mongoose.Schema({
   username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function (request, response) {
    response.render("home");
});
app.get("/login", function (request, response) {
    response.render("login");

})
app.get("/register", function (request, response) {
    response.render("register");

})


app.get("/secrets", function(request,response){
    if(request.isAuthenticated()){
        response.render("secrets")
    }
    else{
        response.render("login");
    }
})


app.get("/logout", function(req,res){
   req.logOut(function(err){
    if(err){
        console.log(err);
    }
    else{
        res.redirect("/");
    }
   })
    

})
app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })

        }
    })



})

app.post("/login", function (req, res) {
    const user=new User({
        username:req.body.username,
        password:req.body.password

    });
   
    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            })
        }
    })



})






app.listen(3000, function () {
    console.log("Listening to port 3000");
})


