const express = require("express");
const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.sendFile("/public/html/index.html", { root: __dirname });
});

app.listen(3000);