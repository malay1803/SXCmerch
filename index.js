const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Product = require('./models/merchandise');
const Contact = require('./models/contact');
const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');
const Address = require('./models/address');
const { urlencoded } = require('express');

require("dotenv").config();

const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const { CLIENT_RENEG_LIMIT } = require('tls');

mongoose.connect('mongodb://localhost:27017/sxcdatabase', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
      console.log("Mongo Connection Open!!");
  })
  .catch(err => {
      console.log("ERROR");
      console.log(err);
  })

const sessionConfig = { 
    secret: 'GoodMorningAll',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: 1000*60*60*24*7
    }

};
const select= [];
const price = [];
const price_value=[" Under ₹100"," ₹100 - ₹500"," Over ₹500"];
categories = ['tshirt','hoodie','cap','mask','brooch'];
sizes = ['S','M','L','XL','XXL'];
let productId;
let productSize;
let finalcost=0;
let uName="";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session(sessionConfig));
app.use(flash());

app.get('/', (req,res) => {
    res.render('home',{uName,login:req.session.user_id, messages: req.flash('error')});
})


app.post('/signup',async (req,res)=>{
    const {Name,Email,Password,cPassword}=req.body;

    if(Password == cPassword ){
        const hash = await bcrypt.hash(Password,12);
        const user = new User({
            Name,Email,Password:hash
        });
        await user.save();
        req.session.user_id = user._id;  
        uName=Name;  
    }
    else{
        req.flash('error',"Please match confirm password");
    }
    let location="/"+req.body.add;
    
        res.redirect(location);
    
    // res.send("Password donot match");
})

app.put('/login', async(req,res) =>{
    const {Email, Password, cPassword} = req.body;
    // const otp=1234;
    if(Password== cPassword){
        const hash = await bcrypt.hash(Password,12);
        const userUpdate = await User.findOneAndUpdate({Email: Email}, {Password: hash},{runValidators: true, new: true, useFindAndModify: false});
    }
    // const Cartput = await Cart.findOneAndUpdate({ProductID: id},{Quantity: Quantity},{runValidators: true, new: true, useFindAndModify: false});
    // console.log(Cartput);
    let location="/"+req.body.add;
    req.flash('error',"Password Reset Successful");
    res.redirect(location);
})

app.post('/login', async (req,res) =>{
    const {Email1,Password1}= req.body;
    const user = await User.findOne({Email: Email1});
    // let url = req.headers.referer;
    // spliturl = url.split("/");
    // finalurl = spliturl[3];
    // console.log(finalurl);
    if(!user)
    {
        req.flash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/');
        
    }
    const validPwd = await bcrypt.compare(Password1, user.Password);
    if(validPwd)
    {
        req.session.user_id = user._id;
        uName=user.Name;
        var location="/".concat(req.body.add);
        console.log('logged in!! ',location);
        res.redirect(location);
    }
    else
    {
        req.flash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/');
    }
} )


app.post('/logout', (req,res) => {
    req.session.destroy();
    let location="/"+req.body.add;
    if(location!="/cart"){
        res.redirect(location);
    }else{
        res.redirect("/");
    }
})

app.get('/merchandise', async (req,res) => {
    const products = await Product.find({});
    res.render('merchandise',{uName,products,select,categories,price,price_value, login:req.session.user_id,messages: req.flash('error')});
})

app.post('/category', async (req,res) =>{
    // const products = await Product.find({});
    // const category=[]
    // for(let p of products){
    //     category.push(p.pCategory)    
    // }
    // const uniq = [...new Set(category)];
    // const select=[]
    for(let pr of categories){
        const p= req.body[pr];
        if(p=="on"){
            if(!select.includes(pr))
                select.push(pr)        
        }
        else{
            if(select.includes(pr)){
            const index = select.indexOf(pr)
            if (index > -1) {
              select.splice(index, 1)
            } 
        }
        }
    }
   
    for(let a of price_value){
        const p= req.body[a];
        if(p=="on"){
            if(!price.includes(a))
                price.push(a)        
        }
        else{
            if(price.includes(a)){
            const index = price.indexOf(a)
                if (index > -1) {
                    price.splice(index, 1)
                } 
            }
        }
    }
    
    console.log(select  + "  " + price)
    res.redirect('/merchandise');
})

app.get('/about',(req,res) => {
    res.render('about',{uName,login:req.session.user_id,messages: req.flash('error')});
})
app.get('/contact', async (req,res) => {
    if(req.session.user_id){
      const id = req.session.user_id;
      const user = await User.findById({_id: id});
      res.render('contact',{uName,user:user, login:req.session.user_id,messages: req.flash('error')});
    }
    else{
        res.render('contact',{uName,login:req.session.user_id,messages: req.flash('error')});
    }

    // if(req.session.user_id){
    //     const {Name,Email}=req.body;
    //     res.render('contact',{login:!req.session.user_id,name1:Name,email1:Email});}
    // else{
    //     res.render('contact',{login:!req.session.user_id});
    // }
})

app.post('/contact', async (req,res) => {
    const {Name, Email1, Message} = req.body;
    console.log(Name, Email1, Message);
    const addMessage = new Contact({
        Name,
        Email1,
        Message
    });
    await addMessage.save();
    req.flash('error',"Result line 193----");
    res.redirect('/contact');
})

app.get('/order', async (req,res) => {
    if(req.session.user_id){
        const userid = req.session.user_id;
        const cartItem = await Cart.find({UserID: userid});
        //console.log(cartItem);
        let arrayy = [];
        for(let cart of cartItem){
            let cartProduct = await Product.find({_id: cart.ProductID});
            arrayy.push(cartProduct);
        }
        //console.log(arrayy);

        // subtotal and final total code for cart
        let subtotal=0;
        let i=0;
        for (let arr of arrayy)
        {
            subtotal= subtotal+ (arr[0].pPrice*cartItem[i].Quantity);
            i++;
        }
        //console.log(subtotal);
        let shipping=100;
        if(subtotal>=1000 || subtotal==0)
            shipping = 0
        let tax = subtotal/10;
        finaltotal = subtotal+shipping+tax;
        //console.log(finaltotal);
        res.render('order',{uName,cartItem: cartItem, arrayy: arrayy,finaltotal,subtotal,shipping,tax, login:req.session.user_id,messages: req.flash('error')});
    }else{
        res.redirect("/notfound")
    }
})

app.get('/cart', async (req,res) => {
    if(req.session.user_id){
        const userid = req.session.user_id;
        const cartItem = await Cart.find({UserID: userid});
        //console.log(cartItem);
        let arrayy = [];
        for(let cart of cartItem){
            let cartProduct = await Product.find({_id: cart.ProductID});
            arrayy.push(cartProduct);
        }
        //console.log(arrayy);

        // subtotal and final total code for cart
        let subtotal=0;
        let i=0;
        for (let arr of arrayy)
        {
            subtotal= subtotal+ (arr[0].pPrice*cartItem[i].Quantity);
            i++;
        }
        //console.log(subtotal);
        let shipping=100;
        if(subtotal>=1000 || subtotal==0)
            shipping = 0
        let tax = subtotal/10;
        finaltotal = subtotal+shipping+tax;
        //console.log(finaltotal);
        res.render('cart',{uName,cartItem: cartItem, arrayy: arrayy,finaltotal,subtotal,shipping,tax, login:req.session.user_id,messages: req.flash('error')});
    }else{
        res.redirect("/notfound")
    }
})

app.post('/cart/:id', async (req,res) =>{
    
    const userid = req.session.user_id; 
    if(userid){
        const {id} = req.params;
        let size="";
        const item = await Product.findById({_id: id});
        console.log(item);
        if(['tshirt','hoodie'].includes(item.pCategory)){
            size = req.body.size;
        }      
        const cartfind = await Cart.find({UserID: userid, Size: size, ProductID: id});
        console.log(cartfind);
    
        if(cartfind.length == 0){
            const cartobject = new Cart({
                UserID: userid,
                ProductID: id,
                Size: size,
                Quantity: 1
            });
        await cartobject.save();
    }
    else{
        if(cartfind[0].Quantity != 9){
            const incrementqty = cartfind[0].Quantity + 1;
            const Cartput = await Cart.findOneAndUpdate({UserID: userid,ProductID: id,Size: size},{Quantity: incrementqty},{runValidators: true, new: true, useFindAndModify: false});
        }}
    }
    else{
        req.flash('error',"Please Login first.")
    }
    res.redirect('/merchandise');
})




app.put('/cart/:id', async(req,res) =>{
    const {id} = req.params;

    // console.log(req.body);
    const {Quantity,hiddensize} = req.body;
    console.log(Quantity, hiddensize);
    const Cartput = await Cart.findOneAndUpdate({UserID:req.session.user_id,ProductID: id,Size: hiddensize},{Quantity: Quantity},{runValidators: true, new: true, useFindAndModify: false});
    //sconsole.log(Cartput);
    res.redirect('/cart');
})

app.delete('/cart/:id', async (req,res) =>{
    const {id} = req.params;
    const cartItem = await Cart.findOneAndDelete({UserID:req.session.user_id,ProductID: id});
    // console.log(cartItem);
    res.redirect('/cart');
})


app.post('/address', async (req,res) => {
    const {First, Last, address1, PinCode, City, State, Phone, productid,productsize} = req.body;
    // console.log(productid,productsize);
    // console.log(First, Last, address1, PinCode, City, State, Phone);
    productId = productid;
    productSize = productsize;
    const Name=First+" "+Last;
    const UserID = req.session.user_id;

    if(productId!=""){
        const prod = await Product.findOne({_id: productId});
        let subcost = prod.pPrice;
        
        shipping=100;
        if(subcost>=1000)
            shipping = 0
        tax = subcost/10;
        finalcost = subcost+shipping+Math.round(tax);
        console.log(finalcost);
    }
    else{
        finalcost = Math.round(finaltotal);
    }

    const findAddress = await Address.find({UserID,Name,Address: address1, City,State,PinCode,Phone});
    // console.log(findAddress);
    if(findAddress.length === 0)
    {
        const addAddress = new Address({
            UserID,
            Name,
            Address:address1,  
            City, 
            State, 
            PinCode,
            Phone
        });
        await addAddress.save();
    }
    res.redirect('/paynow');
})

// ------------------ stripe payment ------------------- 

const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY

const SECRET_KEY = process.env.SECRET_KEY

const stripe = require("stripe")(SECRET_KEY);



app.get("/paynow", (req, res) => {
    if(req.session.user_id){
        res.render("payInput", {
            key: PUBLISHABLE_KEY,
            amount: finalcost,
            Name: uName
        });
    }else{
        res.redirect("/notfound")
    }
});

let transId 

app.post("/paynow", async (req, res) => {
    if(req.session.user_id){
        stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken,
            name: "User_" + new Date().getTime()
            
        })
        .then((customer)=>{
            return stripe.charges.create({
            amount: Math.round(finalcost)*100,
            description: 'Order From SXC MERCH',
            currency: "INR",
            customer: customer.id
            })
        })
        .then((charge)=>{
            console.log(charge)
            transId = charge.id;
            console.log(req.body.stripeToken)
            res.redirect("/success")
        })
        .catch((err)=>{
            res.send(err)
        })
    }else{
        res.redirect("/notfound")
    }
});

app.get('/success', async(req,res)=>{
  const charge = await stripe.charges.retrieve(
    transId
  );

  const UserID= req.session.user_id;
//   console.log(productId);
  if(productId==""){
    const cartItem = await Cart.find({UserID});
    //console.log(cartItem);
    let arrayy = [];
    for(let cart of cartItem){
        let cartProduct = await Product.find({_id: cart.ProductID});
        arrayy.push(cartProduct);
    }

    for(let arr of arrayy){
      const ProductID= arr[0]._id;
      const Size= productSize;
      const Quantity = 1;
      const Date1 = (new Date()).toISOString().slice(0,10);
      const TransactionID = transId;
      const PaymentMode = charge.payment_method_details.type;
      const Total = (charge.amount)/100;
      //   console.log(ProductID,Size,Quantity,Date1,TransactionID,PaymentMode,Total);
      const NewOrder = new Order({
          UserID,
          ProductID,
          Size,
          Quantity,
          OrderDate: Date1,
          TransactionID,
          PaymentMode,
          Total
      });
      await NewOrder.save();
    }
    
  }
  else
  {
      const ProductID= productId;
      const Size= productSize;
      const Quantity = 1;
      const Date1 = (new Date()).toISOString().slice(0,10);
      const TransactionID = transId;
      const PaymentMode = charge.payment_method_details.type;
      const Total = (charge.amount)/100;
      //   console.log(ProductID,Size,Quantity,Date1,TransactionID,PaymentMode,Total);
      const NewOrder = new Order({
          UserID,
          ProductID,
          Size,
          Quantity,
          OrderDate: Date1,
          TransactionID,
          PaymentMode,
          Total
      });
      await NewOrder.save();
    
  }

  res.render('success', {
    Name:uName,
    amount: charge.amount,
    paymentMethod: charge.payment_method_details.type,
    last4: charge.payment_method_details.card.last4,
    network: charge.payment_method_details.card.network,
    transactionId: transId
  })
//   console.log(charge)
})

app.get('/notfound', (req, res)=>{
    res.render('notFound')
})

app.use((req,res)=>{
    res.status(404).redirect("notFound")
})

app.listen(3000, () =>{
    console.log("Listening on port 3000")
})