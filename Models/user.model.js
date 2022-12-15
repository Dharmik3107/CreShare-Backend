const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      default: "",
    },
    mobileNumber: {
      type: String,
      required: true,
      default: "",
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
    salt: {
      type: String,
      default: "",
    },
  },
  { collection: "creshare-users" }
);

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
};

userSchema.methods.validPassword = function (password) {
  const hashedpassword = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.password === hashedpassword;
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
