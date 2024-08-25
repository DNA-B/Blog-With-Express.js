const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose
        .connect(process.env.DB_URI)
        .then(() => console.log("Connected to Database"))
        .catch((err) => console.log(`Error: ${err}`));
};

module.exports = connectDB;
