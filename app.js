require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
const { stringify } = require("querystring");
const encrypt= require("mongoose-encryption");
app.use(bodyParser.urlencoded({
    extended:true
}));
const dbURL = 'mongodb://127.0.0.1:27017/userDB'
app.set('view engine','ejs');
app.use(express.static("public"));


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


const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:["password"]});

const User=mongoose.model("User", userSchema);

app.get("/", function(request,response){
    response.render("home");
});
app.get("/login", function(request,response){
    response.render("login");

})
app.get("/register", function(request, response){
    response.render("register");

})
app.post("/register", function(req,res){
    const newUser= new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save()
    .then(()=>{
       res.render("secrets")
    })
    .catch((err)=>{
        console.log(err)
    });


})

app.post("/login", function(req,res){
   username=req.body.username;
    password=req.body.password;
User.findOne({email:username})
.then((founduser)=>{
    if(founduser.password===password){
        res.render("secrets")
    }
    else{
        res.render("login")
    }
})
.catch((err)=>{
    console.log(err)
})
    
})






app.listen(3000, function(){
    console.log("Listening to port 3000");
})


