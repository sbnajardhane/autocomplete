/*
The main file to create dictionary or to get suggestion
 */

const readLine = require("readline");
const lookUp = require("./lookup");
const express = require("express");

var options = {
    verbose: 2,
    editDistanceMax: 1,
    debug: true
};
var lookup = new lookUp(options);
var api = true;

if(api) {
    var app = express();
    const port = 3101;
    // get request to the autocomplete suggestions
    app.get("/api/autocomplete/:_query", (req, res) => {
        let query = req.params._query;
        console.log("query", query);
        lookup.correct(query, "").then((suggestions) => {
            console.log("suggestions", suggestions);
            res.json(suggestions);
        }).catch((err) => {
            console.log("error");
            res.json({ error: err });
        });
    });
    // Listen on port
    app.listen(port);

} else {
    var rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on("line", function(word) {
        if(word === ".exit") {
            process.exit();
        }
        if (typeof word !== undefined && word !== "") {
            var suggestions = lookup.correct(word.trim(), "");
            console.log("suggestions", suggestions);
            suggestions = suggestions.suggestions;
            for (var key in suggestions) {
                var suggestion = suggestions[key];
                if (suggestion.distance === 0) {
                    console.log("spelling is correct");
                    break;
                }
                else {
                    console.log(suggestion.term + " " + suggestion.distance + " " + suggestion.count, suggestion);
                }
            }
            console.log(suggestions.length + "  suggestions");
        }
    });
}