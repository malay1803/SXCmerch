const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const Product = require('./models/product');
const User = require('./models/user');
const { urlencoded } = require('express');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost:27017/sxcdatabase', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
      console.log("Mongo Connection Open!!");
  })
  .catch(err => {
      console.log("ERROR");
      console.log(err);
  })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({ secret: 'aayushjagwani' , resave: false , saveUninitialized: true}));
app.use(flash());


app.get('/', (req,res) => {
    res.render('home',{login:!req.session.user_id});
})


app.post('/signup',async (req,res)=>{
    const {Name,Email,Password,cPassword}=req.body;

    if(Password == cPassword ){
        const hash = await bcrypt.hash(Password,12);
        const user = new User({
        Name,Email,Password:hash
    });
    await user.save();
    res.redirect('/');
    }
    // res.send("Password donot match");
})

app.post('/login', async (req,res) =>{
    const {Email1,Password1}= req.body;
    const user = await User.findOne({Email: Email1});
    if(!user)
    {
        req.flash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/login');
        
    }
    const validPwd = await bcrypt.compare(Password1, user.Password);
    if(validPwd)
    {
        console.log('logged in!!');
        req.session.user_id = user._id;
        res.redirect('/merchandise');
    }
    else
    {
        reqflash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/login');
    }
} )

app.post('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
})

app.get('/merchandise',(req,res) => {
    res.render('merchandise',{login:!req.session.user_id});
})
app.get('/about',(req,res) => {
    res.render('about',{login:!req.session.user_id});
})
app.get('/contact',(req,res) => {
    if(req.session.user_id){
        const {Name,Email}=req.body;
        res.render('contact',{login:!req.session.user_id,name1:Name,email1:Email});}
    else{
        res.render('contact',{login:!req.session.user_id});
    }
})

app.listen(3000, () =>{
    console.log("Listening on port 3000")
})