var MyApiV1 = require("my_api_v1");
var $ = require("jquery");


let ApiClient = new MyApiV1.ApiClient("http://localhost:49151/");
ApiClient.defaultHeaders = {
}

let companyApi = new MyApiV1.CompanyApi(ApiClient);

$(document).ready(function () {
  $("#label").click(function () {
    console.log("click");
    companyApi.getCompanyes((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Returned data: ' + JSON.stringify(data));
      }
    });
  });
});
