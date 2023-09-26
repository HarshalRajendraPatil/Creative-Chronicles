const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://harshalrptl62:qwerty123@creativechronicles.xsopma2.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(
    console.log("Successfully connected to database"),
    app.listen(3000, () => {
      console.log("Server started at port 3000");
    })
  );

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: [true, "Please upload a Blog body"],
  },
  coverImage: {
    type: String,
    required: [true, "Please upload a image"],
  },
});

const Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/subscribe", (req, res) => {
  res.render("form");
});

app.get("/post", (req, res) => {
  res.render("blogpost");
});

app.post("/success", (req, res) => {
  const name = req.body.firstName;
  const email = req.body.email;
  res.render("success", { name: name, email: email });
});

app.post("/post", async (req, res) => {
  let blog = {
    title: req.body.title,
    body: req.body.content,
    coverImage: req.body.image,
  };
  const data = await Blog.create(blog);
  blog = {
    title: req.body.title,
    body: req.body.content,
    coverImage: req.body.image,
    _id: data._id,
  };
  res.render("singleBlog", blog);
});

app.get("/blogs", async (req, res) => {
  let blog = await Blog.find();
  if (blog.length === 0) {
    return res.render("nothing");
  }
  blog = blog.reverse();
  blog.forEach((el) => {
    el.title = el.title.slice(0, 20);
    el.body = el.body.slice(0, 70);
  });
  res.render("allBlogs", { blog });
});

app.post("/blogs", async (req, res) => {
  let search = req.body.search;
  let blog = await Blog.find();
  blog = blog.reverse();
  let newBlog;
  if (req.body.search) {
    newBlog = blog.filter((el) => {
      return el.title.match(search);
    });
  } else {
    newBlog = blog;
  }

  if (newBlog.length === 0) {
    return res.render("nothing");
  }

  newBlog.forEach((el) => {
    el.title = el.title.slice(0, 20);
    el.body = el.body.slice(0, 70);
  });
  res.render("allBlogs", { blog: newBlog });
});

app.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("singleBlog", blog);
});

app.get("/delete/:id", async (req, res, next) => {
  await Blog.findByIdAndDelete({ _id: req.params.id });
  res.redirect("/blogs");
});
