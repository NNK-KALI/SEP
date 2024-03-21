// const createError = require('http-errors');
const express = require('express');
const cors = require("cors");
const path = require('node:path');
// const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require("config");

// const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin.js');
const eventsRouter = require("./routes/events.js");
const authRouter = require("./routes/auth.js");
const participantRouter = require("./routes/participants.js");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const app = express();
const PORT = 7000;

const jwtToken = config.get("jwtPrivateKey");
if (!jwtToken) {
  console.error("specify jwt token");
  process.exit(1);
}

// configure cors
app.use(cors({
  origin: '*', // Allow requests from any origin
  credentials: true, // You may need this if your frontend sends cookies
}));

mongoose.connect("mongodb://localhost:27017/test")
  .then(() => console.log("connected to mongodb."))
  .catch((reason) => {
    console.log(`failed to connect to mongodb.\n${reason}`);
    process.exit(1);
  });


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.get("/hello", (req, res) => {
  res.json("Hello world");
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/participants", participantRouter);
// app.use('/users', usersRouter);
// app.use("/events", eventsRouter);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


app.listen(PORT, console.log(`Listening on ${PORT}...`));
