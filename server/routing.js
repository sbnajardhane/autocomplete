/*
Express module to route the requests
*/

// Require the needed modules
const express = require("express");
const autoComplete = require("./lookup_utils/main.js");

// Initialize the express application
const app = express();
const port = 3000;

// autoComplete.generateLookupFiles("./lookup_utils/in.txt");

// get request to the autocomplete suggestions
app.get("/api/autocomplete/:_query", (req, res) => {
    let query = req.params._query;
    console.log("query", query);
    autoComplete.getSuggestion(query).then((suggestions) => {
        console.log("suggestions", suggestions);
        res.json(suggestions);
    }).catch((err) => {
        console.log("error");
        res.json({ error: err });
    });
});

// Listen on port
app.listen(port);
