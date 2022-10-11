const mongodb = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3003;
const mongoose = require("mongoose");
const User = require("./schemas/user-schema.js");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

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

// strategy for checking if user is signed in or not
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.jwt_secret,
};

const strategy = new JwtStrategy(jwtOptions, async function (
  jwt_payload,
  next
) {
  const user = await User.findOne({ _id: jwt_payload._id });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
app.use(passport.initialize());
// strategy for checking if user is signed in or not --end

app.post("/auth/signup", (req, res) => {
  console.log("sign up");
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

app.post("/auth/signin", (req, res) => {
  console.log("sign in");
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  const query = { email: email };
  // find user by email
  User.findOne(query, async function (err, user) {
    if (err) {
      console.log("error");
      console.error(err);
      res.status(422).json({
        success: false,
        message: `Could not find user with email ${email}`,
      });
    } else {
      console.log("email match - user found");
      console.log(user.password);
      // check if the password is correct
      const isValid = await bcrypt.compare(password, user.password);
      console.log("password is valid: ");
      console.log(isValid);
      if (isValid) {
        console.log("user");
        console.log(user);
        const token = jwt.sign({ _id: user._id }, process.env.jwt_secret);
        res.status(200).json({
          success: true,
          token: token,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "The password is not correct",
        });
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

app.delete(
  "/sandbox/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = req.params.id;
    console.log(id);
    res.json({
      message:
        "You were authenticated to delete a document in the sandbox collection",
    });
  }
);

app.listen(port, () => {
  console.log(`Travel destinations app listening on port ${port}`);
});
