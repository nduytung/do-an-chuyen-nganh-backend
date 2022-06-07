var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const authRouter = require("./routes/auth");
const projectRouter = require("./routes/project");
const imageRouter = require("./routes/image");
const usersRouter = require("./routes/user");
const connectDB = require("./asyncFunctions/connectDB");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
var bodyParser = require("body-parser");
var app = express();
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.1.1",
      title: "Kick Starter API",
      description: "Kick Starter Documentation",
      contact: {
        name: "Duy Tung",
      },
      servers: ["http://localhost:4000"],
    },
  },
  apis: ["app.js", "./routes/project.js"],
};

app.use(bodyParser.json({ limit: "150mb" }));
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    limit: "150mb",
    extended: true,
  })
);
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDB();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/project", projectRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/image", imageRouter);
app.use("/", (req, res) => {
  res.send("Hello, this is our backend - overwritten by Duy Tung");
});
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
