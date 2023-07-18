const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
app.use(bodyParser.urlencoded({
    extended:true
}));
app.set('view engine','ejs');
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

const userSchema={
    
    email:String,
    password:String
    
}
const user= new mongoose.model("user", userSchema)
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
    


})

app.listen(3000, function(){
    console.log("Listening to port 3000");
})


