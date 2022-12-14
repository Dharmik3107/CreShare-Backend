const mongoose = require("mongoose");

const dbConnect = () => {
  const connectionParams = { useNewUrlParser: true };
  mongoose.connect(process.env.DB_URL, connectionParams);

  mongoose.connection.on("connected", () => {
    console.log("Connected to Database successfully");
  });

  mongoose.connection.on("error", (error) => {
    console.log(error.message + "Error While Connecting");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Database connection disconnected");
  });
};

module.exports = dbConnect;
