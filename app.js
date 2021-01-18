var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Cors = require("cors");
const BodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const client = require("./db").client;

var app = express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(Cors());

app.get("/search", async (request, response) => {
  try {
    const collection = client.db("refrens").collection("user");
    let result = await collection
      .aggregate([
        {
          $search: {
            compound: {
              should: [
                {
                  autocomplete: {
                    query: `${request.query.query}`,
                    path: "name",
                  },
                },
                {
                  autocomplete: {
                    query: `${request.query.query}`,
                    path: "address",
                  },
                },
                {
                  autocomplete: {
                    query: `${request.query.query}`,
                    path: "pincode",
                  },
                },
                {
                  autocomplete: {
                    query: `${request.query.query}`,
                    path: "id",
                  },
                },
                {
                  text: {
                    query: `${request.query.query}`,
                    path: "items",
                  },
                },
              ],
            },
            highlight: {
              path: ["id", "address", "name", "pincode", "items"],
              maxNumPassages: 1,
              maxCharsToExamine: 40,
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            items: 1,
            pincode: 1,
            address: 1,
            highlights: { $meta: "searchHighlights" },
          },
        },
      ])
      .toArray();
    response.send(result);
  } catch (e) {
    response.status(500).send({ message: e.message });
  }
});

// app.get("/get/:id", async (request, response) => {});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
