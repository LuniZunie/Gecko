const express = require("express");
const ejs = require("ejs");

const connection = require("/workspace/Gecko/connect.js");
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
    //res.redirect("/home");
    res.redirect("/live-game");
}); 
/*app.get("/home", function (req, res) {
    res.render("pages/home/HTML/Index.ejs");
});*/
/*app.get("/find-games", function (req, res) {
    res.render("pages/find-games/HTML/Index.ejs");
});*/
app.get("/live-game", function (req, res) {
    res.render("pages/live-game/HTML/Index.ejs");
});
app.get("/connect/game", function (req, res) {
    const id = req.query.id;
    const game = connection.getLiveGame(id);

    res.send(game);
});
app.post("/connect/game", function (req, res) {
    const data = req.query.data;
    const gameId = connection.createLiveGame(data);

    res.send(gameId);
});
app.use((req, res, next) => {
    res.status(404).redirect("/");
});