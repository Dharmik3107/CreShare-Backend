const express = require("express");
require("dotenv").config();
const cors = require("cors");
const dbConnect = require("./Database/database");
const authRoutes = require("./Routes/auth");
const app = express();
dbConnect();

app.use(cors());
app.use(express.json({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    messgae: "Hello backend",
  });
});

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, (error) => {
  if (error) return error.message;
  console.log("Server started on port " + process.env.PORT);
});
