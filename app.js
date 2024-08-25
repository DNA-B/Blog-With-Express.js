require("dotenv").config();

const methodOverride = require("method-override");
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const { isActiveRoute } = require("./server/helpers/routeHelper");
const connectDB = require("./server/config/db");

const app = express();
const PORT = 5000 || process.env.PORT;

// DB connect
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("helloworld"));
app.use(
    session({
        secret: "bshdnabbsh",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60,
        },
        store: MongoStore.create({
            mongoUrl: process.env.DB_URI,
        }),
    })
);

app.use(express.static("public"));

// Template Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
