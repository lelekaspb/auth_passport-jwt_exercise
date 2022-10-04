const mongodb = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3003;
const mongoose = require("mongoose");
const User = require("./schemas/user-schema.js");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

const connectionStringAtlas =
  "mongodb+srv://dragon:hello123@travel-destinations.kjlf6mx.mongodb.net/travel_destinations_db?retryWrites=true&w=majority";

try {
  mongoose.connect(
    connectionStringAtlas,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected")
  );
} catch (err) {
  console.log("could not connect");
}

app.post("/auth/signup", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  user.save(function (err) {
    if (err) {
      console.log("error");
      console.error(err);
      res.status(422).json(err);
    } else {
      console.log("user");
      console.log(user);
      res.status(201).json(user);
    }
  });
});

app.get("/auth/signin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  console.log("sign in");
  const query = { email: email, password: password };
  User.findOne(query, function (err, user) {
    if (err) {
      console.log("error");
      console.error(err);
      res
        .status(422)
        .json({ success: false, message: "Could not find this user" });
    } else {
      console.log("user");
      console.log(user);
      if (user) {
        const token = jwt.sign({ _id: user._id }, "secretPutInEnvFile");
        res.status(200).json(token);
      }
    }
  });
});

app.get("/auth", async (req, res) => {
  User.find({}, function (err, users) {
    if (err) {
      res.status(422).json(err);
    } else {
      res.status(200).json(users);
    }
  });
});

app.listen(port, () => {
  console.log(`Travel destinations app listening on port ${port}`);
});
