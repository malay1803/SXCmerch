require("dotenv").config();
const DBUrl = process.env.DB_url;

const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Product = require("./models/merchandise");
const Contact = require("./models/contact");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");
const Admin = require("./models/admin");
const Address = require("./models/address");
const { urlencoded } = require("express");

const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoDBStore = require('connect-mongo');
const flash = require("connect-flash");
const { CLIENT_RENEG_LIMIT } = require("tls");

// "mongodb://localhost:27017/sxcdatabase"

mongoose
  .connect(DBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo Connection Open!!");
  })
  .catch((err) => {
    console.log("ERROR");
    console.log(err);
  });

const store = new MongoDBStore({
  mongoUrl: DBUrl,
  secret: "GoodNightAll",
  touchAfter: 24*60*60
});

const sessionConfig = {
  store,
  secret: "GoodMorningAll",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
const select = [];
const price = [];
const price_value = [" Under ₹100", " ₹100 - ₹500", " Over ₹500"];
categories = ["tshirt", "hoodie", "cap", "mask", "brooch"];
sizes = ["S", "M", "L", "XL", "XXL"];
let productId;
let productSize;
let finalcost = 0;
let count = 0;
let uName = "";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(session(sessionConfig));
app.use(flash());

app.get("/", async(req, res) => {
  count = (await Cart.find({UserID:req.session.user_id})).length;
  res.render("home", {
    uName,
    count,
    login: req.session.user_id,
    messages: req.flash("error"),
  });
});

app.get('/products', async (req,res) => {
  const adminid = req.session.user_id;
  const admin = await Admin.find({_id: adminid});
  if(admin.length==0)
  {
    res.redirect('/notfound');
  }
  const prodlist = await Product.find();
  res.render('products', {prodlist});
})

app.get("/admin", async (req, res) => {

  const adminid = req.session.user_id;
  const admin = await Admin.find({_id: adminid});
  if(admin.length==0)
  {
    res.redirect('/notfound');
  }
  let transid="";
  let checker = [0,0,0,0,0];
  let monthcheck = [0,0,0,0,0,0,0,0,0,0,0,0]
  let orderCount = 0;
  let orderdata = await Order.find({});
  for(let data of orderdata){
    //console.log(data.OrderDate.toISOString().slice(5,7));
    if(transid!=data.TransactionID){
        orderCount=orderCount+1;
        for(let i=1;i<=12;i++){
          let month = parseInt(data.OrderDate.toISOString().slice(5,7));
          if(month==i){
            monthcheck[i-1]++;
          }
        }
        // console.log(monthcheck);
    }
    transid=data.TransactionID

    const product1 = await Product.find({_id: data.ProductID});
    // console.log(product1[0].pCategory);
    for(let i=0;i<checker.length;i++){
      if(categories[i]==product1[0].pCategory){
        // console.log("hi");
        checker[i]=checker[i]+data.Quantity;
      }
    }

  }
  let users = (await User.find({})).length;
  //console.log(users,checker,orderCount);
  const Date1 = new Date().toUTCString().slice(0, 16);
  const Time1 = new Date().toLocaleString().slice(9,22);

  res.render("admin",{admin,Date1,monthcheck,Time1,checker,orderCount,users});
});

app.get("/orders", async (req, res) => {
  const adminid = req.session.user_id;
  const admin = await Admin.find({_id: adminid});
  if(admin.length==0)
  {
    res.redirect('/notfound');
  }
  const user = await User.find();
  
  let OrderList;
  OrderList = await Order.find({});
  OrderList.reverse();

  let OrderProduct = [];
  for (let orders of OrderList) {
    let OProduct = await Product.find({ _id: orders.ProductID });
    OrderProduct.push(OProduct);
  }
  res.render("orders", {
      user, 
      OrderList,
      OrderProduct,
      login: req.session.user_id,
      messages: req.flash("error"),
    });
});


app.put("/orders/:id", async (req, res) => {
  const {id} = req.params;
  const { status} = req.body;
  const OrderList = await Order.updateMany(
    { TransactionID: id },
    { Status: status },
    { runValidators: true, new: true, useFindAndModify: false }
  );
  //console.log(Cartput);
  res.redirect("/orders");
});

app.put('/update', async (req,res) => {
  const {productid1, productName, productDesc, unitPrice, pcategory1} = req.body;
  console.log(productid1, productName, productDesc, unitPrice, pcategory1);
  const updateProduct = await Product.updateMany(
    {_id: productid1},
    { pName: productName, pDescription: productDesc, pPrice: unitPrice, pCategory: pcategory1 },
    { runValidators: true, new: true, useFindAndModify: false }
  );
  res.redirect("/products");
})

app.post('/new', async (req,res) => {
  const { newName, newDesc, newPrice, newImage, newCategory} = req.body;
  console.log(newName, newDesc, newPrice, newImage, newCategory);
  let imgurl = "/image/merch/"+newImage;

  const newProduct = new Product({
    pName: newName,
    pPrice: newPrice,
    pImage: imgurl,
    pDescription: newDesc,
    pCategory: newCategory
  });
  await newProduct.save();
  res.redirect('/products');
})

app.post("/admin", async (req, res) => {
  const { LoginID, Password } = req.body;

  const admin = await Admin.findOne({ LoginID: LoginID });
  if (!admin) {
    req.flash("error", "Incorrect Credentials, Try Again!");
    res.redirect("/");
  }
  const validPwd = await bcrypt.compare(Password, admin.Password);
  if (validPwd) {
    req.session.user_id = admin._id;
    uName = admin.Name;
    
    res.redirect('/admin');
  } else {
    req.flash("error", "Incorrect Credentials, Try Again!");
    res.redirect("/");
  }
});


app.get("/message", async(req, res) => {
  const adminid = req.session.user_id;
  const admin = await Admin.find({_id: adminid});
  if(admin.length==0)
  {
    res.redirect('/notfound');
  }
  const contactData = await Contact.find();
  
  res.render("message",{contactData});
});

app.delete("/message/:id", async (req, res) => {
  const {id} = req.params;
  await Contact.findOneAndDelete({_id: id,});
  res.redirect("/message");
});

app.get("/users", async(req, res) => {
  const adminid = req.session.user_id;
  const admin = await Admin.find({_id: adminid});
  if(admin.length==0)
  {
    res.redirect('/notfound');
  }
  const user = await User.find();
  let arrayy=[]
  let transid=""
  for (let u of user) {
    let OrderCount = 0;
    let orderdata = await Order.find({ UserID: u._id});
    for(let data of orderdata){
      if(transid!=data.TransactionID){
        OrderCount=OrderCount+1;
        
      }
      transid=data.TransactionID
    }
    arrayy.push(OrderCount);
  }
  res.render("users",{user,arrayy});
});

app.delete("/users/:id", async (req, res) => {
  const {id} = req.params;
  await User.findOneAndDelete({_id: id,});
  await Cart.deleteMany({UserID: id});
  await Order.deleteMany({UserID:id});
  await Address.deleteMany({UserID:id});
  res.redirect("/users");
});

app.post("/signup", async (req, res) => {
  const { Name, Email, Password, cPassword } = req.body;

  if (Password == cPassword) {
    const hash = await bcrypt.hash(Password, 12);
    const user = new User({
      Name,
      Email,
      Password: hash,
    });
    await user.save();
    req.session.user_id = user._id;
    uName = Name;
  } else {
    req.flash("error", "Please match confirm password");
  }
  let location = "/" + req.body.add;

  res.redirect(location);

  // res.send("Password donot match");
});

app.put("/login", async (req, res) => {
  const { Email, Password, cPassword } = req.body;
  // const otp=1234;
  if (Password == cPassword) {
    const hash = await bcrypt.hash(Password, 12);
    const userUpdate = await User.findOneAndUpdate(
      { Email: Email },
      { Password: hash },
      { runValidators: true, new: true, useFindAndModify: false }
    );
  }
  // const Cartput = await Cart.findOneAndUpdate({ProductID: id},{Quantity: Quantity},{runValidators: true, new: true, useFindAndModify: false});
  // console.log(Cartput);
  let location = "/" + req.body.add;
  req.flash("error", "Password Reset Successful");
  res.redirect(location);
});

app.post("/login", async (req, res) => {
  const { Email1, Password1 } = req.body;
  const user = await User.findOne({ Email: Email1 });
  // let url = req.headers.referer;
  // spliturl = url.split("/");
  // finalurl = spliturl[3];
  // console.log(finalurl);
  if (!user) {
    req.flash("error", "Incorrect Credentials, Try Again!");
    res.redirect("/");
  }
  const validPwd = await bcrypt.compare(Password1, user.Password);
  if (validPwd) {
    req.session.user_id = user._id;
    uName = user.Name;
    count = (await Cart.find({ UserID: req.session.user_id })).length;
    var location = "/".concat(req.body.add);
    // console.log('logged in!! ',location);
    res.redirect(location);
  } else {
    req.flash("error", "Incorrect Credentials, Try Again!");
    res.redirect("/");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  let location = "/" + req.body.add;
  if (location != "/cart" && location != "/admin") {
    res.redirect(location);
  } else {
    res.redirect("/");
  }
});

app.get("/merchandise", async (req, res) => {
  const products = await Product.find({});
  count = (await Cart.find({ UserID: req.session.user_id })).length;
  res.render("merchandise", {
    uName,
    count,
    products,
    select,
    categories,
    price,
    price_value,
    login: req.session.user_id,
    messages: req.flash("error"),
  });
});

app.post("/category", async (req, res) => {
  // const products = await Product.find({});
  // const category=[]
  // for(let p of products){
  //     category.push(p.pCategory)
  // }
  // const uniq = [...new Set(category)];
  // const select=[]
  for (let pr of categories) {
    const p = req.body[pr];
    if (p == "on") {
      if (!select.includes(pr)) select.push(pr);
    } else {
      if (select.includes(pr)) {
        const index = select.indexOf(pr);
        if (index > -1) {
          select.splice(index, 1);
        }
      }
    }
  }

  for (let a of price_value) {
    const p = req.body[a];
    if (p == "on") {
      if (!price.includes(a)) price.push(a);
    } else {
      if (price.includes(a)) {
        const index = price.indexOf(a);
        if (index > -1) {
          price.splice(index, 1);
        }
      }
    }
  }

  //console.log(select + "  " + price);
  res.redirect("/merchandise");
});

app.get("/about", (req, res) => {
  res.render("about", {
    uName,
    count,
    login: req.session.user_id,
    messages: req.flash("error"),
  });
});

app.get("/contact", async (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const user = await User.findById({ _id: id });
    res.render("contact", {
      uName,
      count,
      user: user,
      login: req.session.user_id,
      messages: req.flash("error"),
    });
  } else {
    res.render("contact", {
      uName,
      count,
      login: req.session.user_id,
      messages: req.flash("error"),
    });
  }

  // if(req.session.user_id){
  //     const {Name,Email}=req.body;
  //     res.render('contact',{login:!req.session.user_id,name1:Name,email1:Email});}
  // else{
  //     res.render('contact',{login:!req.session.user_id});
  // }
});

app.post("/contact", async (req, res) => {
  const { Name, Email1, Message } = req.body;
  const addMessage = new Contact({
    Name,
    Email1,
    Message,
  });
  await addMessage.save();
  req.flash("error", "Successfully submit.");
  res.redirect("/contact");
});

app.get("/order", async (req, res) => {
  if (req.session.user_id) {
    const userid = req.session.user_id;

    const AdminId = await Admin.findOne({ _id: userid });
    console.log(AdminId);
    let OrderList;
    if (AdminId) {
      OrderList = await Order.find({});
    } else {
      OrderList = await Order.find({ UserID: userid });
      // console.log(OrderList.reverse());
    }
    let OrderProduct = [];
    for (let orders of OrderList) {
      let OProduct = await Product.find({ _id: orders.ProductID });
      OrderProduct.push(OProduct);
    }
    // console.log(OrderProduct);
    count = (await Cart.find({ UserID: req.session.user_id })).length;
    res.render("order", {
      uName,
      Ocount:(await Order.find({ UserID: req.session.user_id })).length,
      count,
      OrderList,
      OrderProduct,
      login: req.session.user_id,
      messages: req.flash("error"),
    });
  } else {
    res.redirect("/notfound");
  }
});

app.get("/cart", async (req, res) => {
  if (req.session.user_id) {
    const userid = req.session.user_id;
    const cartItem = await Cart.find({ UserID: userid });
    //console.log(cartItem);
    let arrayy = [];
    for (let cart of cartItem) {
      let cartProduct = await Product.find({ _id: cart.ProductID });
      arrayy.push(cartProduct);
    }
    //console.log(arrayy);

    // subtotal and final total code for cart
    let subtotal = 0;
    let i = 0;
    for (let arr of arrayy) {
      subtotal = subtotal + arr[0].pPrice * cartItem[i].Quantity;
      i++;
    }
    //console.log(subtotal);
    let shipping = 100;
    if (subtotal >= 1000 || subtotal == 0) shipping = 0;
    let tax = subtotal / 10;
    finaltotal = subtotal + shipping + tax;
    //console.log(finaltotal);
    count = (await Cart.find({ UserID: req.session.user_id })).length;
    res.render("cart", {
      uName,
      count,
      cartItem: cartItem,
      arrayy: arrayy,
      finaltotal,
      subtotal,
      shipping,
      tax,
      login: req.session.user_id,
      messages: req.flash("error"),
    });
  } else {
    res.redirect("/notfound");
  }
});

app.post("/cart/:id", async (req, res) => {
  const userid = req.session.user_id;
  if (userid) {
    const { id } = req.params;
    let size = "";
    const item = await Product.findById({ _id: id });
    //console.log(item);
    if (["tshirt", "hoodie"].includes(item.pCategory)) {
      size = req.body.size;
    }
    const cartfind = await Cart.find({
      UserID: userid,
      Size: size,
      ProductID: id,
    });
    //console.log(cartfind);

    if (cartfind.length == 0) {
      const cartobject = new Cart({
        UserID: userid,
        ProductID: id,
        Size: size,
        Quantity: 1,
      });
      await cartobject.save();
    } else {
      if (cartfind[0].Quantity != 9) {
        const incrementqty = cartfind[0].Quantity + 1;
        const Cartput = await Cart.findOneAndUpdate(
          { UserID: userid, ProductID: id, Size: size },
          { Quantity: incrementqty },
          { runValidators: true, new: true, useFindAndModify: false }
        );
      }
    }
  } else {
    req.flash("error", "Please Login first.");
  }
  res.redirect("/merchandise");
});

app.put("/cart/:id", async (req, res) => {
  const { id } = req.params;

  // console.log(req.body);
  const { Quantity, hiddensize } = req.body;
  //console.log(Quantity, hiddensize);
  const Cartput = await Cart.findOneAndUpdate(
    { UserID: req.session.user_id, ProductID: id, Size: hiddensize },
    { Quantity: Quantity },
    { runValidators: true, new: true, useFindAndModify: false }
  );
  //console.log(Cartput);
  res.redirect("/cart");
});

app.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const cartItem = await Cart.findOneAndDelete({
    UserID: req.session.user_id,
    ProductID: id,
  });
  // console.log(cartItem);
  res.redirect("/cart");
});

app.post("/address", async (req, res) => {
  const {
    First,
    Last,
    address1,
    PinCode,
    City,
    State,
    Phone,
    productid,
    productsize,
  } = req.body;
  // console.log(productid,productsize);
  // console.log(First, Last, address1, PinCode, City, State, Phone);
  productId = productid;
  productSize = productsize;
  const Name = First + " " + Last;
  const UserID = req.session.user_id;
  console.log(productSize);

  if (productId != "") {
    const prod = await Product.findOne({ _id: productId });
    let subcost = prod.pPrice;

    shipping = 100;
    if (subcost >= 1000) shipping = 0;
    tax = subcost / 10;
    finalcost = subcost + shipping + Math.round(tax);
    console.log(finalcost);
  } else {
    finalcost = Math.round(finaltotal);
  }

  const findAddress = await Address.find({
    UserID,
    Name,
    Address: address1,
    City,
    State,
    PinCode,
    Phone,
  });
  // console.log(findAddress);
  if (findAddress.length === 0) {
    const addAddress = new Address({
      UserID,
      Name,
      Address: address1,
      City,
      State,
      PinCode,
      Phone,
    });
    await addAddress.save();
  }
  res.redirect("/paynow");
});

// ------------------ stripe payment -------------------

const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY;

const SECRET_KEY = process.env.SECRET_KEY;

const stripe = require("stripe")(SECRET_KEY);

app.get("/paynow", (req, res) => {
  if (req.session.user_id) {
    res.render("payInput", {
      key: PUBLISHABLE_KEY,
      amount: finalcost,
      Name: uName,
    });
  } else {
    res.redirect("/notfound");
  }
});

let transId;

app.post("/paynow", async (req, res) => {
  if (req.session.user_id) {
    stripe.customers
      .create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: "User_" + new Date().getTime(),
      })
      .then((customer) => {
        return stripe.charges.create({
          amount: Math.round(finalcost) * 100,
          description: "Order From SXC MERCH",
          currency: "INR",
          customer: customer.id,
        });
      })
      .then((charge) => {
        //console.log(charge);
        transId = charge.id;
        console.log(req.body.stripeToken);
        res.redirect("/success");
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.redirect("/notfound");
  }
});

app.get("/success", async (req, res) => {
  const charge = await stripe.charges.retrieve(transId);

  const UserID = req.session.user_id;
  //   console.log(productId);
  if (productId == "") {
    const cartItem = await Cart.find({ UserID });

    //console.log(cartItem);
    let arrayy = [];
    for (let cart of cartItem) {
      let cartProduct = await Product.find({ _id: cart.ProductID });
      arrayy.push(cartProduct);
    }
    let i = 0;
    for (let arr of arrayy) {
      const ProductID = arr[0]._id;
      const Size = cartItem[i].Size;
      const Quantity = cartItem[i].Quantity;
      const Date1 = new Date().toISOString().slice(0, 10);
      const TransactionID = transId;
      const PaymentMode = charge.payment_method_details.type;
      const prod= await Product.find({_id:arr[0]._id});
      const Price=prod[0].pPrice;
      const Total = charge.amount / 100;
      const Status ="pending"
      //   console.log(ProductID,Size,Quantity,Date1,TransactionID,PaymentMode,Total);
      const NewOrder = new Order({
        UserID,
        ProductID,
        Size,
        Quantity,
        OrderDate: Date1,
        TransactionID,
        PaymentMode,
        Price,
        Total,
        Status
      });
      await NewOrder.save();
      i++;
    }

    const EmptyCart = await Cart.deleteMany({ UserID: UserID });
  } else {
    const ProductID = productId;
    const Size = productSize;
    const Quantity = 1;
    const Date1 = new Date().toISOString().slice(0, 10);
    const TransactionID = transId;
    const PaymentMode = charge.payment_method_details.type;
    const prod= await Product.find({_id:productId});
    const Price=prod[0].pPrice;
    const Total = charge.amount / 100;
    const Status="pending"
      console.log(ProductID,Size,Quantity,Date1,TransactionID,PaymentMode,Total);
    const NewOrder = new Order({
      UserID,
      ProductID,
      Size,
      Quantity,
      OrderDate: Date1,
      TransactionID,
      PaymentMode,
      Price,
      Total,
      Status
    });
    await NewOrder.save();
  }

  res.render("success", {
    Name: uName,
    amount: charge.amount,
    paymentMethod: charge.payment_method_details.type,
    last4: charge.payment_method_details.card.last4,
    network: charge.payment_method_details.card.network,
    transactionId: transId,
  });
  //   console.log(charge)
});

app.get("/notfound", (req, res) => {
  res.render("notFound");
});

app.use((req, res) => {
  res.status(404).redirect("notFound");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
