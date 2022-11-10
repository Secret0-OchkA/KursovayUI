const express = require("express");
const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.sendFile("/public/html/index.html", { root: __dirname });
});

app.listen(3000);



//var MyApiV1 = require("my_api_v1");

//let ApiClient = new MyApiV1.ApiClient("http://api/");

//let apiInstance = new MyApiV1.OkApi(ApiClient);
//let compApi = new MyApiV1.CompanyApi(ApiClient);

//console.log("start");
//compApi.getCompanyes((error, data, response) => {
//  if (error) {
//    console.error(error);
//  } else {
//    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//  }
//});

//var $ = require("jquery");

//$(document).ready(function () {
//  $("p").click(function () {
//    $(this).hide();
//  });
//});