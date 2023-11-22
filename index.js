require("./utils.js");
const express = require("express"); // imports the express.js module and assigns it to a constant variable named express
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("homepage", {});
});
app.use(express.static(__dirname + "/public"));

const port = 8000
app.listen(port, () => {
    console.log("Running on port " + port)
})

// 404 error
app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
});