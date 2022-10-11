const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String, unique: true, required: "Email is required" },
  password: { type: String, required: "Password is required" },
});

// encrypt password before storing the new user in db
// - with the use og mongoose hooks
UserSchema.pre("save", async function (next) {
  // do stuff
  const hash = await bcrypt.hash(this.password, 10);
  console.log(hash);
  this.password = hash;
  next();
});
module.exports = mongoose.model("User", UserSchema);
