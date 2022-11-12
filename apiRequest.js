var MyApiV1 = require("my_api_v1");
var $ = require("jquery");

var companyId = 1;

let ApiClient = new MyApiV1.ApiClient("http://localhost:49151/");
ApiClient.defaultHeaders = {
}

let companyApi = new MyApiV1.CompanyApi(ApiClient);
let departmentApi = new MyApiV1.DepartmentApi(ApiClient);
let employeeApi = new MyApiV1.EmployeeApi(ApiClient);
let empDepartmentApi = new MyApiV1.EmployeeFromDepartmentApi(ApiClient);
let expEmployeeApi = new MyApiV1.ExpenseFromEmployeeApi(ApiClient);
let expenseTypeApi = new MyApiV1.ExpenseTypeApi(ApiClient);
let bugetPlanApi = new MyApiV1.BugetPlanApi(ApiClient);

$(document).ready(function () {

  UpdateDepartment();
  UpdateExpenseType();
  UpdateEmployee();

  //TODO: ExpenseType====================================
  {
    ////Get
    function UpdateExpenseType() {
      expenseTypeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log(JSON.stringify(data));
          let selectors = $(".select-expenseType")
          selectors.empty();
          for (let i = 0; i < data.length; i++) {
            selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          }
        }
      });
    }
    ////Create
    $("#btn-c-expenseType").click(function () {

      let expenseType = new MyApiV1.ExpenseTypeView();
      expenseType.id = 0;
      expenseType.name = $('#formCreateExpenseTypeName').val();
      expenseType.description = $('#formCreateExpenseTypeDescription').val();
      expenseType.limit = $('#formCreateExpenseTypeLimit').val();

      let opts = {
        'expenseTypeView': expenseType // DepartmentView | 
      };
      expenseTypeApi.createExpenseTypeInCompany(companyId, opts, (error, data, response) => {
        if (error) {
          console.error(JSON.stringify(response['body']));
        } else {
          console.log('Create ExpenseType');
          UpdateExpenseType();
        }
      });
    });
    ////Delete
    $("#btn-d-expenseType").click(function () {

      let expenseTypeId = $("#formDeleteExpense").val() // Number | 
      expenseTypeApi.deleteExpenseTypeInCompany(companyId, expenseTypeId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Delet ExpenseType');
          UpdateExpenseType();
        }
      });
    });
  }
  //TODO: Expense=================================
  ////Get

  ////Delete

  ////Create


  //TODO: Employee=================================
  {
    ////Get
    function UpdateEmployee() {
      employeeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log(JSON.stringify(data));
          let selectors = $(".select-expenseType")
          selectors.empty();
          for (let i = 0; i < data.length; i++) {
            selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          }
        }
      });
    }
    ////Create
    $("#btn-c-employee").click(function () {

      let expenseType = new MyApiV1.EmployeeView();
      expenseType.id = 0;
      expenseType.name = $('#inputEmployeeName').val();

      let opts = {
        'EmployeeView': expens = eType // DepartmentView | 
      };
      employeeApi.createEmployee(opts, (error, data, response) => {
        if (error) {
          console.error(JSON.stringify(response['body']));
        } else {
          console.log('Create Employee');
          UpdateEmployee();
        }
      });
    });
    ////Delete
    $("#btn-d-employee").click(function () {

      let employeeId = $("#formDeleteEmployeeEmployee").val() // Number | 
      employeeApi.deleteEmployee(employeeId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Delet Employee');
          UpdateEmployee();
        }
      });
    });
  }
  //TODO: Department================================
  {
    //Get
    function UpdateDepartment() {
      departmentApi.getDepartments(companyId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log(JSON.stringify(data));

          let selectors = $(".select-department")
          selectors.empty();
          for (let i = 0; i < data.length; i++) {
            selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          }
        }
      });
    }
    //Create
    $("#btn-c-department").click(function () {

      let department = new MyApiV1.DepartmentView();
      department.id = 0;
      department.name = $('#formCreateDepartmentName').val();
      department.buget = $('#formCreateDepartmentBuget').val();;

      let opts = {
        'departmentView': department // DepartmentView | 
      };
      departmentApi.createDepartment(companyId, opts, (error, data, response) => {
        if (error) {
          console.error(JSON.stringify(response['body']));
        } else {
          console.log('Create Department');
          UpdateDepartment();
        }
      });
    });
    ////Delete
    $("#btn-d-department").click(function () {
      let opts = {
        'departmnetId': $("#formDeleteDepartmentSelect").val() // Number | 
      };
      departmentApi.deleteDepartment(companyId, opts, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Delet Department');
          UpdateDepartment();
        }
      });
    });
  }
  //TODO: BugetPlan=================================
  ////Get

  //Create

  //Delete

  //SetMonthBuget

});