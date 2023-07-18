const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
app.use(bodyParser.urlencoded({
    extended:true
}));
app.set('view engine','ejs');
app.use(express.static("public"));

app.get("/", function(request,response){
    response.render("home");
});
app.get("/login", function(request,response){
    response.render("login");

})
app.get("/register", function(request, response){
    response.render("register");

})

app.listen(3000, function(){
    console.log("Listening to port 3000");
})


