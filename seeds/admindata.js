require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const bcrypt = require('bcrypt');
DBUrl= process.env.DB_url;

let Admins = [
    {
        LoginID: 'AAYUSH70143',
        Password: '7014358705',
        Name: 'Aayush'
    },
    {
        LoginID: 'MALAY93723',
        Password: '9372392981',
        Name: 'Malay'
    },
    {
        LoginID: 'ABHI73950',
        Password: '7395039084',
        Name: 'Abhishek'
    }
];


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

const adminDB = async () => {
  await Admin.deleteMany({});
  for (let i = 0; i < Admins.length; i++) {
    const hash = await bcrypt.hash(Admins[i].Password,12);
    const adm = new Admin({
      LoginID: Admins[i].LoginID,
      Password: hash,
      Name: Admins[i].Name
    });
    await adm.save();
  }
};

adminDB();
