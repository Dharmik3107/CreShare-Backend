const express = require("express");
require("dotenv").config();
const cors = require("cors");
const dbConnect = require("./Database/database");

const app = express();
dbConnect();

app.use(cors());
app.use(express.json({ extended: false }));

app.listen(process.env.PORT, (error) => {
  if (error) return error.message;
  console.log("Server started on port " + process.env.PORT);
});
