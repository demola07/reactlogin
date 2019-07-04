const express = require("express");
const app = express();
const mongo = require("mongoose");
const cors = require("cors");
const PORT = 8080;
app.use(express.json());
app.use(cors());
const user = require("./models/users");

mongo.connect("mongodb://127.0.0.1:27017/nesa", err => {
  if (err) {
    console.log("BROKEN");
  } else {
    console.log("CONNECTED");
  }
});

app.post("/signup", (req, res) => {
  const userDetails = req.body;
  const newUser = new user(userDetails);
  newUser.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.send("I got an error");
    } else {
      // return res.json(doc);
      if (doc) {
        return res.json({
          status: true,
          userDetails: doc
        });
      } else {
        return res.json({
          status: false,
          message: "Pls try again"
        });
      }
    }
  });
});

app.post("/signin", (req, res) => {
  const userDetails = req.body;
  user.findOne(userDetails, (err, doc) => {
    if (err) {
      return res.send("I got an error");
    } else {
      if (doc) {
        return res.json({
          status: true,
          userDetails: doc
        });
      } else {
        return res.json({
          status: false,
          message: "No User Matching Details"
        });
      }
    }
  });
});

app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("And We are live!!!!!!");
  }
});
