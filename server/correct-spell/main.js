/*
The main file to create dictionary or to get suggestion
 */

const lookUp = require("./lookup");
const express = require("express");

var options = {
    verbose: 2,
    editDistanceMax: 3,
    debug: true
};
var lookup = new lookUp(options);

var app = express();
const port = 3101;
// get request to the autocomplete suggestions
app.get("/api/autocomplete/:_language/:_query", (req, res) => {
    let query = req.params._query;
    let language = req.params._language;
    console.log("query", query);
    lookup.correct(query, language).then((suggestions) => {
        console.log("suggestions", suggestions);
        res.json(suggestions);
    }).catch((err) => {
        console.log("error", err);
        res.json({ error: err });
    });
});
// Listen on port
app.listen(port);
