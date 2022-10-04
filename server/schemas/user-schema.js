const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String, unique: true, required: "Email is required" },
  password: { type: String, required: "Password is required" },
});
module.exports = mongoose.model("User", UserSchema);
