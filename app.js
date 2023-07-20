require ("dotenv").config();
const express = require('express');
const session = require("express-session");
const router = require("./routes/router");
const passport = require("passport");
const cors = require('cors')
const app = express();
const bodyParser = require("body-parser");
require("./db/connection");



app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set("view engine", "ejs");


app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

let port = process.env.PORT;

if (port == null || port == ""){
    port = 4000;
}
app.listen(port, function () {
    console.log(`Server has started successfully at ${port}`);
});
