const express = require("express");
const app = express();
const mongo = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const PORT = 8080;
app.use(express.json());
app.use(cors());
const user = require("./models/users");
const blog = require("./models/blog");
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

  const { error, value } = Joi.validate(userDetails, schema);
  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message
    });
  }
  user.findOne({ email: value.email }, (err, existingUser) => {
    if (err) {
      return res.json(err);
    }
    if (!existingUser) {
      const password = value.password;
      var salt = bcrypt.genSaltSync(saltRounds);
      var hash = bcrypt.hashSync(password, salt);
      value.password = hash;

      const newUser = new user(value);
      newUser.save((err, doc) => {
        if (err) {
          console.log(err);
          return res.send("Database Error");
        } else {
          return res.json({
            status: true,
            value: doc
          });
        }
      });
    } else {
      return res.json({
        status: false,
        message: `User already exists`
      });
    }
  });
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
  const result = Joi.validate(userDetails, schema);
  const err = result.error;
  const value = result.value;
  if (err) {
    return res.json({
      status: false,
      message: err.details[0].message
    });
  }

  const password = value.password;
  user.findOne({ email: value.email }, (err, doc) => {
    if (err) {
      return res.send("I got a database Error");
    } else {
      if (doc) {
        if (bcrypt.compareSync(password, doc.password)) {
          return res.json({
            status: true,
            value: doc
          });
        } else {
          return res.json({
            status: false,
            message: `Wrong password`
          });
        }
      } else {
        return res.json({
          status: false,
          message: "No User Matching Details"
        });
      }
    }
  });
});

app.post("/publishpost", (req, res) => {
  const post = req.body;
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    author: Joi.string().required(),
    body: Joi.string().required(),
    date: Joi.string()
  });
  const { error, value } = Joi.validate(post, schema);
  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message
    });
  }
  const newPost = new blog(value);
  newPost.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.send(`Error`);
    } else {
      res.json({
        status: true,
        post: doc,
        message: `Post successfully saved`
      });
    }
  });
});

app.post("/getposts", (req, res) => {
  blog.find({}, (err, doc) => {
    return res.json(doc);
  });
});

app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("And We are live!!!!!!");
  }
});
