import UserModel from "../Models/user.model";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import * as dotenv from "dotenv";
import crypto from "crypto";
import { sendEmail } from "../Utilities/Mailer";

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
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};
