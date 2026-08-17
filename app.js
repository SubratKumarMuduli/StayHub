const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"/public")));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayHub");
}

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("app is listening at port 3000");
});

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.get("/listings", (req, res) => {
  listing.find().then((result) => {
    res.render("listings/index", { result });
  });
});

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let list = await listing.findOne({ _id: `${id}` });
  res.render("listings/view.ejs", { list });
});

app.post("/listings/new", async (req, res) => {
  const { titl, desc, img, pric, loc, contry } = req.body;
  await listing.insertOne({
    title: titl,
    description: desc,
    image: img,
    price: pric,
    location: loc,
    country: contry,
  });
  res.redirect("/listings");
});

app.get("/listings/:id/edit", async(req, res) => {
  let { id } = req.params;
  let list = await listing.findOne({ _id: `${id}` });
  res.render("listings/edit.ejs", { list,id });
});

app.put("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const { titl, desc, img, pric, loc, contry } = req.body;
  await listing.findByIdAndUpdate(id, {
    $set: {
      title: titl,
      description: desc,
      image: img,
      price: pric,
      location: loc,
      country: contry,
    },
  });
  res.redirect("/listings");
});

app.delete("/listings/:id", async (req, res) => {
  let {id} = req.params;
  await listing.findByIdAndDelete(id);
  res.redirect("/listings");
});
