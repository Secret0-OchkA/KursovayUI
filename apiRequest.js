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
let expDepartmentApi = new MyApiV1.ExpenseFromDepartmentApi(ApiClient);
let bugetPlanApi = new MyApiV1.BugetPlanApi(ApiClient);

$(document).ready(function () {
  UpdateDepartment();
  UpdateExpenseType();
  UpdateEmployee();
  UpdateExpense();

  //ExpenseType====================================
  //Get
  function UpdateExpenseType() {
    expenseTypeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));
        let selectors = $(".select-expenseType");
        let table = $("#tableExpenseType > tbody");
        table.empty();
        selectors.empty();
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <th>${i}</th>
          <td>${data[i].name}</td>
          <td>${data[i].limit}</td>
          <td>${data[i].description}</td>
        </tr>`);
        }
      }
    });
  }
  //Create
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
  //Delete
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

  //TODO: Expense=================================
  //Get
  function UpdateExpense() {
    employeeApi.getEmployees((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        let employees = data;
        expenseTypeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
          if (error) {
            console.error(error);
          } else {
            let expenseTypes = data;
            expDepartmentApi.getExpesesInCompany(companyId, (error, data, response) => {
              if (error) {
                console.error(error);
              } else {
                console.log(JSON.stringify(data));
                let table = $("#tableExpense > tbody");
                table.empty();
                for (let i = 0; i < data.length; i++) {
                  table.append(`<tr>
                    <td style="display:none;">${data[i].id}</td>
                    <td style="display:none;">${data[i].employeeId}</td>
                    <th>${i}</th>
                    <td>${data[i].amount}</td>
                    <td>${data[i].date.getFullYear()}/${data[i].date.getMonth()}/${data[i].date.getDate()}</td>
                    <td>${expenseTypes.find(expType => expType.id == data[i].expenseTypeId).name}</td>
                    <td>${employees.find(emp => emp.id == data[i].employeeId).name}</td>
                    <td><button id='btn${i}-d-expense' class='btn btn-primary d-expense' type='button'>delete</button></td>
                  </tr>`);

                  $(`#btn${i}-d-expense`).click(function () {
                    $("this").closest("tr").find("td:first").text("test");
                    $("this").closest("tr").children("td:nth-child(1)").text();
                    expEmployeeApi.deleteExpense(expenseId, employeeId, (error, data, response) => {
                      if (error) {
                        console.error(error);
                      } else {
                        console.log('delete expense');
                      }
                    });
                  });
                }
              }
            });
          }
        });
      }
    });
  }


  //Create
  $("#btn-c-expense").click(function () {
    let employeeId = $("#formCreateExpenseEmployee").val(); // Number | 

    let expense = new MyApiV1.ExpenseView();
    expense.Amount = $("#formCreateExpenseAmount").val();
    expense.expenseTypeId = $("#formCreateExpenseExpenseType").val();

    let opts = {
      'expenseView': expense // ExpenseView | 
    };
    expEmployeeApi.createExpense(employeeId, opts, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Create Expense');
        UpdateExpense();
      }
    });
  });
  //Delete
  $("#btn-d-expense").click(function () {
    let id = $("TODO").val();
    let employeeId = "employeeId_example"; // String | 
    expEmployeeApi.deleteExpense(id, employeeId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('API called successfully.');
      }
    });
  });


  //Employee=================================
  //Get
  function UpdateEmployee() {

    let departments;
    departmentApi.getDepartments(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        departments = data;
      }
    });

    employeeApi.getEmployees((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));
        let selectors = $(".select-employee");
        let table = $("#tableEmployee > tbody");
        table.empty();
        selectors.empty();
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <th>${i}</th>
          <td>${data[i].name}</td>
        </tr>`);
        }
      }
    });
  }
  //Create
  $("#btn-c-employee").click(function () {

    let employee = new MyApiV1.EmployeeView();
    employee.id = 0;
    employee.name = $('#inputEmployeeName').val();

    let opts = {
      'employeeView': employee // EmployeeView | 
    };
    employeeApi.createEmployee(opts, (error, data, response) => {
      if (error) {
        console.error(JSON.stringify(response['body']));
      } else {
        console.log('Create Employee');
        UpdateEmployee();
      }
    });

    UpdateEmployee();
  });
  //Delete
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

  //Department================================
  //Get
  function UpdateDepartment() {
    departmentApi.getDepartments(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));

        departments = data;

        let selectors = $(".select-department");
        let table = $("#tableDepartment > tbody");
        selectors.empty();
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <th>${i}</th>
          <td>${data[i].name}</td>
          <td>${data[i].budget}</td>
        </tr>`);
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
  //Delete
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
  //Add employee to department
  $("#btn-u-addEmployee").click(function () {
    let departmnetId = $("#departmentForAddedEmployee").val();// Number | 
    let employeeId = $("#employeAddedToDepartment").val(); // Number | 
    empDepartmentApi.hireEmployee(companyId, departmnetId, employeeId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('add to depertment');
        UpdateDepartment();
      }
    });
  });

  //TODO: BugetPlan=================================
  //Get

  //Create

  //Delete

  //SetMonthBuget



});