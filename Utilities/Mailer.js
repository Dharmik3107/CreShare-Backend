const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendEmail = (username, email, data) => {
  transport.sendMail(
    {
      from: process.env.EMAIL,
      to: email,
      subject: "Please verify Your Account",
      html: `<h1>Email Confirmation</h1>
        <h2>Hello ${username}</h2>
        <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
        <a href=https://www.hazguard.tech/verify/${data}> Click here</a>`,
    },
    (error) => {
      console.log(error.message);
    }
  );
};

module.exports = sendEmail;
