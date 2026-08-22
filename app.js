const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/public")));

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

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    await listing.find().then((result) => {
      res.render("listings/index", { result });
    });
  }),
);

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let list = await listing.findOne({ _id: `${id}` });
    res.render("listings/view.ejs", { list });
  }),
);

// Create Route
app.post(
  "/listings/new",
  wrapAsync(async (req, res, next) => {
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
  }),
);

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let list = await listing.findOne({ _id: `${id}` });
    res.render("listings/edit.ejs", { list, id });
  }),
);

// Edit Route
app.put(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
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
  }),
);

// Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs",{message});
});
