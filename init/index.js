const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("../models/listing.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayHub");
};

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
    await listing.insertMany(initdata);
    console.log("data inserted");
}

initDB();