var express = require('express');
const ejs = require('ejs');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('pages'));

app.use('/pages', express.static('pages'));
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Port website will run on
app.listen(3030) // This is actually the port it will listen on, default 8080 as of now.
console.log("Listening on port 8080. Check code for more info.");


// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    res.redirect('/game');
});
app.get('/game', function (req, res) {
    res.render('game/HTML/Index.ejs');
});
app.use((req, res, next) => {
    res.status(404).redirect('/');
});