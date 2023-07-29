require('dotenv').config()
var md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const { stringify } = require("querystring");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
GitHubStrategy=require("passport-github2").Strategy;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { userInfo } = require('os');
const findOrCreatePlugin = require('mongoose-findorcreate');
const { profile } = require('console');
const dbURL =process.env.DB_URL

findOrCreate= require("mongoose-findorcreate")

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('views', './views');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cors(
    {
        origin:["https://deploy-mern-1whq.vercel.app"],
        methods:["Post","GET"],
        credentials:true
    }
    ));
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
    password: String,
    googleId: String,
    githubId:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


  

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
     
    });
    console.log(profile);
  }
));
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLID,
    clientSecret: process.env.GITHUB_CLSEC,
    callbackURL: "http://localhost:3000/auth/github/secrets"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return done(err, user);
    });
    console.log(profile);
  }
));
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
    User.find({"secret":{$ne:null}})
    .then((foundusers)=>{
     response.render("secrets", {userswithsecrets:foundusers})

    })
    .catch((err)=>{
        console.log(err);
    })
   
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
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
  

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
  app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/secrets', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

  app.get("/submit", function(req,res){
    if(req.isAuthenticated()){
        res.render("submit")
    }
    else{
        res.render("login");
    }
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
app.post("/submit", function(req,res){
    const submitted_secret=req.body.secret
    var id =(req.user._id)
    User.findById(id)
    .then((founduser)=>{
        founduser.secret=submitted_secret;
        founduser.save()
        .then(()=>{
            res.redirect("/secrets")
        })
        .catch((err)=>{
            console.log(err);
        });
        



    })
    .catch((err)=>{
        console.log(err);
    })
})






app.listen(3000, function () {
    console.log("Listening to port 3000");
})


