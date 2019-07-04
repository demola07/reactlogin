const express = require("express");
const app = express();
const mongo = require("mongoose");
const cors = require("cors");
const PORT = 8080;
app.use(express.json());
app.use(cors());
const user = require("./models/users");
const Joi = require("Joi");

mongo.connect("mongodb://127.0.0.1:27017/nesa", err => {
  if (err) {
    console.log("BROKEN");
  } else {
    console.log("CONNECTED");
  }
});

app.post("/signup", (req, res) => {
  const userDetails = req.body;
  const schema = Joi.object().keys({
    fullname: Joi.string().required(),
    username: Joi.string()
      .trim()
      .alphanum()
      .min(4)
      .max(10)
      .required(),
    email: Joi.string()
      .trim()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(10)
      .required()
  });
  Joi.validate(userDetails, schema, (err, result) => {
    if (err) {
      res.send("Validation Error");
    } else {
      const newUser = new user(result);
      newUser.save((err, doc) => {
        if (err) {
          console.log(err);
          return res.send("Database Error");
        } else {
          if (doc) {
            return res.json({
              status: true,
              result: doc
            });
          } else {
            return res.json({
              status: false,
              message: "Pls try again"
            });
          }
        }
      });
    }
  });

  // const newUser = new user(userDetails);
  // newUser.save((err, doc) => {
  //   if (err) {
  //     console.log(err);
  //     return res.send("I got an error");
  //   } else {
  //     if (doc) {
  //       return res.json({
  //         status: true,
  //         userDetails: doc
  //       });
  //     } else {
  //       return res.json({
  //         status: false,
  //         message: "Pls try again"
  //       });
  //     }
  //   }
  // });
});

app.post("/signin", (req, res) => {
  const userDetails = req.body;
  const schema = Joi.object().keys({
    email: Joi.string()
      .trim()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(10)
      .required()
  });
  Joi.validate(userDetails, schema, (err, result) => {
    if (err) {
      res.send("I got an error");
    } else {
      user.findOne(result, (err, doc) => {
        if (err) {
          return res.send("I got a database Error");
        } else {
          if (doc) {
            return res.json({
              status: true,
              result: doc
            });
          } else {
            return res.json({
              status: false,
              message: "No User Matching Details"
            });
          }
        }
      });
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
