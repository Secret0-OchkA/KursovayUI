const express = require("express");
const cors = require('cors');
const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.sendFile("/public/html/index.html", { root: __dirname });
});

app.listen(3000);
console.log("run node server");