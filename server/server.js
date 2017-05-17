const http = require("http");

const port = 3000;
const hostname = "0.0.0.0";

console.log("ok");
http.createServer((req, res) => res.end(`Hello fdsf abcc  World, fsdfdsf sdfsffrom the future! It"s ${
	new Date().getFullYear() + Math.ceil(Math.random() * 100)
    } here, how is it going ok back there in ${new Date().getFullYear()}? :)

`))
    .listen(port, hostname, () => console.info(`listening on http://${hostname}:${port}`));
