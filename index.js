const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// const Product = require('./models/product');
const User = require('./models/user');
const { urlencoded } = require('express');
const methodOverride = require('method-override');
// const bcrypt = require('bcrypt');
// const session = require('express-session');
// const flash = require('connect-flash');

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
// app.use(session({ secret: 'aayushjagwani' , resave: false , saveUninitialized: true}));
// app.use(flash());


app.get('/', (req,res) => {
    res.render('home');
})
app.get('/merchandise',(req,res) => {
    res.render('merchandise');
})
app.get('/about',(req,res) => {
    res.render('about');
})
app.get('/contact',(req,res) => {
    res.render('contact');
})
app.get('/login',(req,res) => {
    res.render('contact');
})
app.listen(3000, () =>{
    console.log("Listening on port 3000")
})