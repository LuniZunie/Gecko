const express = require("express");
const ejs = require("ejs");
const test = require("/workspace/Gecko/connect.js");
// Initialise Express
const app = express();
// Render static files
app.use(express.static("views/partials"));

// Set the view engine to ejs
app.set("view engine", "ejs");
// Port website will run on
app.listen(3030);
console.log("Listening on port 3030. Check code for more info.");


// *** GET Routes - display pages ***
// Root Route
app.get("/", function (req, res) {
    res.redirect("/game");
}); 
app.get("/game", function (req, res) {
    res.render("pages/game/HTML/Index.ejs");
});
app.get("/connect", function (req, res) {
    test.testFunction();
    res.sendFile("/workspace/Gecko/connect.js");
});
app.use((req, res, next) => {
    res.status(404).redirect("/");
});