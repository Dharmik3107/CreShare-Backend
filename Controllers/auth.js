const UserModel = require("../Models/user.model");
const TokenModel = require("../Models/token.model");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const dotenv = require("dotenv");
const { sendEmail } = require("../Utilities/Mailer");

dotenv.config();

//APi to register user
const register = async (req, res) => {
  try {
    //check if user exist or not
    await UserModel.findOne({ email: req.body.email }, (error, user) => {
      if (error)
        return res.status(500).json({
          error: true,
          message: error,
        });
      if (!req.body.username || !req.body.password)
        return res.status(400).json({
          error: true,
          message: "Please fill all the required field",
        });
      if (user)
        return res.status(409).json({
          error: true,
          message: "Email is already registered",
        });

      //now create new user
      const newUser = new UserModel({
        id: v4(),
        email: req.body.email,
        username: req.body.username,
        token: jwt
          .sign(req.body.email, process.env.SECRET_TOKEN_KEY)
          .split(".")
          .join(""),
      });

      //hash the password and store it
      newUser.setPassword(req.body.password);

      //save the user as doc in mongodb database and send email for account verification
      newUser.save((error, result) => {
        if (error)
          return res.status(500).json({
            error: true,
            message: error,
          });
        sendEmail(req.body.username, req.body.email, newUser.token);
        return res.status(200).json({
          message: "User registered Successfully",
        });
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

//API to verify user
const verify = async (req, res) => {
  const receivedToken = req.params.token;
  await UserModel.findOne({ token: receivedToken }, (error, user) => {
    //Error handling
    if (error)
      return res.status(500).json({
        error: true,
        message: error,
      });
    if (!user)
      return res.status(404).json({
        error: true,
        message: "User is not registered",
      });

    //setting user status to active
    user.status = "Active";

    //save the user in Database
    user.save((error) => {
      if (error)
        return res.status(500).json({
          error: true,
          message: error,
        });
      return res.status(200).json({
        message: "User verified successsfully",
      });
    });
  });
};

//Helper function to generate Access Token with 1 day validity
const generateToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

//API to login into the APP
const login = async (req, res) => {
  try {
    UserModel.findOne(
      {
        email: req.body.email,
      },
      (error, user) => {
        //Error handling
        if (error)
          return res.status(500).json({
            error: true,
            message: error,
          });
        if (!user)
          return res.status(404).json({
            error: true,
            message: "User is not registered",
          });

        //check if user verified or not
        if (user.status === "Pending")
          return res.status(403).json({
            error: true,
            message: "User is not verified.Please check your email.",
          });

        //generate tokens
        const accessToken = generateToken({
          id: user.id,
          email: user.email,
        });
        const refreshToken = generateToken(
          {
            id: user.id,
            email: user.enai,
          },
          process.env.REFRESH_TOKEN_KEY
        );

        //creating token doc for database
        const token = new TokenModel({
          email: user.email,
          token: refreshToken,
        });

        //saving the doc in database
        token.save((error, result) => {
          if (error)
            return res.status(500).json({
              error: true,
              message: error.message,
            });
          return res.status(200).json({
            message: "Sign in Successfull",
            accessToken,
            refreshToken,
          });
        });
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

//Logout API
const logout = async (req, res) => {
  try {
    await TokenModel.deleteOne(
      { email: req.body.email, token: req.body.token },
      (error, result) => {
        if (error)
          return res.status(500).json({
            error: true,
            message: error.message,
          });
        if (!result.deletedCount) {
          return res.status(404).json({
            error: true,
            message: "Invalid Token",
          });
        } else {
          return res.status(200).json({
            message: "Logged out successfully",
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { register, verify, login, logout };
