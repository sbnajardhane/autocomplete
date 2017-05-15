/*
 * Autocomplete Server
 *
 */


var express = require('express');
var app = express();

/* to allow cross site domain call 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
 // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

app.get('/', (req, res) => {
    res.send("Hello world");
})

app.get('/autocomplete', (req, res) => {
    console.log("requesting dsafdsa fda");
    res.send("data");
})

app.listen(3000, () => {
    console.log("Web server listening on port 3000 !!");
})
